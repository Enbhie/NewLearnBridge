import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { sendSignInLinkToEmail } from "firebase/auth";
import {
  getMetadata,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { onValue, push, ref as databaseRef } from "firebase/database";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";
import { uploadToCloudinary } from "../../cloudinary";
import { offlineMissions } from "./offlineMissions";
import { readMissionPhoto } from "./readMissionPhoto";
import {
  createMissionSubmissionReference,
  saveMissionSubmission,
} from "./submissions";
import {
  auth,
  cloudFunctions,
  firestore,
  realtimeDatabase,
  storage,
} from "../firebase";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function isMissingStorageObject(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "storage/object-not-found"
  );
}

function getUploadError(error: unknown): Error {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "storage/retry-limit-exceeded"
  ) {
    return new Error(
      "Firebase Storage could not finish the upload before its retry limit. Check the internet connection and confirm EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET names this project's active Storage bucket."
    );
  }
  return error instanceof Error
    ? error
    : new Error("The photo could not be uploaded to Firebase Storage.");
}

async function uploadMissionPhoto(
  photoRef: ReturnType<typeof ref>,
  photoData: Blob,
  contentType: string,
  ownerUid: string,
  submissionId: string,
  onUploadStarted?: () => Promise<void>,
  onUploadProgress?: (progress: number) => void
): Promise<void> {
  if (Platform.OS === "web") {
    await onUploadStarted?.();
    const uploadTask = uploadBytesResumable(photoRef, photoData, {
      contentType,
      customMetadata: {
        ownerUid,
        submissionId,
      },
    });
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            onUploadProgress?.(
              Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            );
          }
        },
        (error) => reject(getUploadError(error)),
        resolve
      );
    });
    return;
  }

  const user = auth?.currentUser;
  if (!user) throw new Error("Sign in again before uploading this mission photo.");

  const boundary = `learnbridge-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const metadata = JSON.stringify({
    name: photoRef.fullPath,
    contentType,
    metadata: {
      ownerUid,
      submissionId,
    },
  });
  const multipartContentType = `multipart/related; boundary=${boundary}`;
  const body = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      photoData,
      `\r\n--${boundary}--`,
    ],
    { type: multipartContentType }
  );
  const idToken = await user.getIdToken();

  await onUploadStarted?.();
  const response = await expoFetch(
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
      photoRef.bucket
    )}/o?name=${encodeURIComponent(photoRef.fullPath)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Firebase ${idToken}`,
        "Content-Type": multipartContentType,
        "X-Goog-Upload-Protocol": "multipart",
      },
      body,
    }
  );

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `Firebase Storage upload failed (${response.status}): ${
        responseBody || response.statusText
      }`
    );
  }
  onUploadProgress?.(100);
}

type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  databaseSubmissionId: string;
};

export type MissionPhotoSubmissionResult =
  | MissionReview
  | {
      id: string;
      missionId: string;
      databaseSubmissionId: string;
      source: "realtime_database";
      status: "awaiting_parent_confirmation";
      reviewEmailError?: string;
    };

export type MissionReviewStatus = "pending" | "approved" | "needs_revision";

export type MissionReview = {
  id: string;
  missionId: string;
  status: MissionReviewStatus;
  source?: "firestore" | "realtime_database";
  databaseSubmissionId?: string;
};

export type MissionPhotoUploadOptions = {
  storageUploaded?: boolean;
  storageProvider?: "firebase" | "cloudinary";
  cloudinaryPublicId?: string;
  cloudinarySecureUrl?: string;
  databaseSubmissionId?: string;
  onUploadStarted?: () => Promise<void>;
  onUploadProgress?: (progress: number) => void;
  onPhotoUploaded?: (photo?: CloudinaryUploadResult) => Promise<void>;
};

type SubmitMissionResponse = {
  status: "pending";
};

export async function submitMissionPhotoForReview(
  missionId: string,
  photoUri: string,
  contentType: string,
  submissionId: string,
  userId: string,
  submittedAt: string,
  uploadOptions: MissionPhotoUploadOptions = {}
): Promise<MissionPhotoSubmissionResult> {
  const user = auth?.currentUser;
  if (!auth || !user || !user.email) {
    throw new Error("Sign in to send this mission to your parent.");
  }
  if (user.uid !== userId) {
    throw new Error("This saved submission belongs to a different account.");
  }
  if (!user.emailVerified) {
    throw new Error("Verify the parent email before sending a mission for review.");
  }
  if (!photoUri) {
    throw new Error("The photo is missing. Take or choose a photo before sending it.");
  }
  if (!contentType.startsWith("image/")) {
    throw new Error("Choose a valid image for the mission.");
  }

  const storageProvider = uploadOptions.storageProvider ?? "firebase";
  const storagePath = `mission-submissions/${user.uid}/${submissionId}/evidence`;
  let cloudinaryPublicId = uploadOptions.cloudinaryPublicId;
  let cloudinarySecureUrl = uploadOptions.cloudinarySecureUrl;
  let databaseSubmissionId = uploadOptions.databaseSubmissionId;
  let storageUploaded =
    uploadOptions.storageUploaded === true ||
    (storageProvider === "cloudinary" &&
      Boolean(cloudinaryPublicId && cloudinarySecureUrl));
  if (storageProvider === "cloudinary") {
    if (!realtimeDatabase) {
      throw new Error(
        "Firebase Realtime Database is not configured. Set EXPO_PUBLIC_FIREBASE_DATABASE_URL."
      );
    }
    if (!databaseSubmissionId) {
      databaseSubmissionId = push(
        databaseRef(realtimeDatabase, `submissions/${user.uid}`)
      ).key ?? undefined;
    }
    if (!databaseSubmissionId) {
      throw new Error("Could not create a Realtime Database submission ID.");
    }
    if (!cloudinarySecureUrl) {
      const { size: photoSize } = await readMissionPhoto(photoUri);
      if (photoSize === 0) {
        throw new Error("The selected photo is empty. Please take or choose it again.");
      }
      if (photoSize > MAX_PHOTO_BYTES) {
        throw new Error("Choose a photo smaller than 5 MB.");
      }
      await uploadOptions.onUploadStarted?.();
      uploadOptions.onUploadProgress?.(0);
      const uploadedPhoto = await uploadToCloudinary(photoUri, {
        contentType,
        fileName: `${submissionId}.${contentType.slice("image/".length)}`,
      });
      cloudinaryPublicId = uploadedPhoto.publicId;
      cloudinarySecureUrl = uploadedPhoto.secureUrl;
      uploadOptions.onUploadProgress?.(100);
      storageUploaded = true;
    }
    if (!cloudinaryPublicId) {
      throw new Error("The Cloudinary photo identifier is missing. Please retry.");
    }
    await uploadOptions.onPhotoUploaded?.({
      publicId: cloudinaryPublicId,
      secureUrl: cloudinarySecureUrl,
      databaseSubmissionId,
    });
    const databaseSubmissionRef = createMissionSubmissionReference(
      realtimeDatabase,
      user.uid,
      databaseSubmissionId
    );
    const missionTitle =
      offlineMissions.find((mission) => mission.id === missionId)?.title ?? missionId;
    const savedStatus = await saveMissionSubmission(databaseSubmissionRef, {
      missionId,
      missionTitle,
      imageUrl: cloudinarySecureUrl,
      status: "pending",
      createdAt: Number.isFinite(Date.parse(submittedAt))
        ? Date.parse(submittedAt)
        : Date.now(),
    });
    if (savedStatus === "pending") {
      const reviewBaseUrl =
        process.env.EXPO_PUBLIC_MISSION_REVIEW_URL?.trim() ||
        `https://${auth.app.options.projectId}.web.app/mission-review`;
      const separator = reviewBaseUrl.includes("?") ? "&" : "?";
      const reviewUrl =
        `${reviewBaseUrl}${separator}uid=${encodeURIComponent(user.uid)}` +
        `&submissionId=${encodeURIComponent(databaseSubmissionId)}` +
        `&missionTitle=${encodeURIComponent(missionTitle)}`;
      try {
        await sendSignInLinkToEmail(auth, user.email, {
          url: reviewUrl,
          handleCodeInApp: true,
        });
      } catch (error) {
        const errorCode =
          typeof error === "object" && error !== null && "code" in error
            ? error.code
            : undefined;
        const reviewEmailError =
          errorCode === "auth/quota-exceeded"
            ? "The photo is uploaded and saved, but Firebase's daily email quota was reached. The parent review link was not sent. Retry after the quota resets."
            : `The photo is uploaded and saved, but the parent review link could not be sent: ${
                error instanceof Error
                  ? error.message
                  : "Firebase Authentication could not send the email."
              }`;
        return {
          id: submissionId,
          missionId,
          databaseSubmissionId,
          source: "realtime_database",
          status: "awaiting_parent_confirmation",
          reviewEmailError,
        };
      }
    }
    return {
      id: submissionId,
      missionId,
      databaseSubmissionId,
      source: "realtime_database",
      status: "awaiting_parent_confirmation",
    };
  }
  if (!storageUploaded) {
    const { data: photoData, size: photoSize } = await readMissionPhoto(photoUri);
    if (photoSize === 0) {
      throw new Error("The selected photo is empty. Please take or choose it again.");
    }
    if (photoSize > MAX_PHOTO_BYTES) {
      throw new Error("Choose a photo smaller than 5 MB.");
    }
    if (!storage) {
      throw new Error("Firebase Storage is not available. Please try again later.");
    }
    const photoRef = ref(storage, storagePath);
    if (uploadOptions.storageUploaded === undefined) {
      try {
        const existingPhoto = await getMetadata(photoRef);
        if (
          existingPhoto.customMetadata?.ownerUid !== user.uid ||
          existingPhoto.customMetadata?.submissionId !== submissionId ||
          existingPhoto.contentType !== contentType ||
          Number(existingPhoto.size) !== photoSize
        ) {
          throw new Error("A different photo is already saved for this submission.");
        }
        storageUploaded = true;
        await uploadOptions.onPhotoUploaded?.();
      } catch (error) {
        if (!isMissingStorageObject(error)) throw error;
      }
    }

    if (!storageUploaded) {
      await uploadMissionPhoto(
        photoRef,
        photoData,
        contentType,
        user.uid,
        submissionId,
        uploadOptions.onUploadStarted,
        uploadOptions.onUploadProgress
      );
      await uploadOptions.onPhotoUploaded?.();
    }
  }

  if (!cloudFunctions) throw new Error("Firebase mission review is not available.");
  const submit = httpsCallable<
    {
      missionId: string;
      submissionId: string;
      storageProvider: "firebase" | "cloudinary";
      storagePath: string;
      cloudinaryPublicId?: string;
      cloudinarySecureUrl?: string;
      databaseSubmissionId?: string;
      submittedAt: string;
    },
    SubmitMissionResponse
  >(cloudFunctions, "submitMissionForReview");
  try {
    await submit({
      missionId,
      submissionId,
      storageProvider,
      storagePath: storageProvider === "firebase" ? storagePath : "",
      ...(cloudinaryPublicId ? { cloudinaryPublicId } : {}),
      ...(cloudinarySecureUrl ? { cloudinarySecureUrl } : {}),
      ...(databaseSubmissionId ? { databaseSubmissionId } : {}),
      submittedAt,
    });
  } catch (error: unknown) {
    const errorDetails =
      typeof error === "object" && error !== null
        ? error
        : {};
    const code =
      "code" in errorDetails && typeof errorDetails.code === "string"
        ? errorDetails.code
        : undefined;
    const message =
      "message" in errorDetails && typeof errorDetails.message === "string"
        ? errorDetails.message
        : undefined;
    console.log("code:", code, "message:", message);
    throw error;
  }

  return { id: submissionId, missionId, status: "pending" };
}

export function listenToMissionReview(
  submissionId: string,
  onReview: (review: MissionReview) => void,
  onError: (error: Error) => void
): () => void {
  if (!firestore) {
    onError(new Error("Firebase mission review is not available."));
    return () => undefined;
  }

  return onSnapshot(
    doc(firestore, "missionSubmissions", submissionId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onError(new Error("The mission review could not be found. Contact your parent for help."));
        return;
      }

      const data = snapshot.data();
      if (
        data.status !== "pending" &&
        data.status !== "approved" &&
        data.status !== "needs_revision"
      ) {
        onError(new Error("The mission review has an unexpected status."));
        return;
      }
      if (typeof data.missionId !== "string") {
        onError(new Error("The mission review is missing its mission details."));
        return;
      }

      onReview({
        id: snapshot.id,
        missionId: data.missionId,
        status: data.status,
      });
    },
    (error) => onError(error)
  );
}

export function listenToRealtimeDatabaseMissionReview(
  userId: string,
  localSubmissionId: string,
  databaseSubmissionId: string,
  onReview: (review: MissionReview) => void,
  onError: (error: Error) => void
): () => void {
  if (!realtimeDatabase) {
    onError(new Error("Firebase Realtime Database is not available."));
    return () => undefined;
  }

  return onValue(
    databaseRef(
      realtimeDatabase,
      `submissions/${userId}/${databaseSubmissionId}`
    ),
    (snapshot) => {
      if (!snapshot.exists()) {
        onError(new Error("The mission review could not be found. Contact your parent for help."));
        return;
      }

      const data = snapshot.val() as {
        missionId?: unknown;
        status?: unknown;
      };
      if (typeof data.missionId !== "string") {
        onError(new Error("The mission review is missing its mission details."));
        return;
      }
      if (
        data.status !== "pending" &&
        data.status !== "approved" &&
        data.status !== "rejected"
      ) {
        onError(new Error("The mission review has an unexpected status."));
        return;
      }

      onReview({
        id: localSubmissionId,
        missionId: data.missionId,
        status: data.status === "rejected" ? "needs_revision" : data.status,
        source: "realtime_database",
        databaseSubmissionId,
      });
    },
    (error) => onError(error)
  );
}
