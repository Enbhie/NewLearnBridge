import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getMetadata, ref, uploadBytes } from "firebase/storage";
import { auth, cloudFunctions, firestore, storage } from "../firebase";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function isMissingStorageObject(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "storage/object-not-found"
  );
}

export type MissionReviewStatus = "pending" | "approved" | "needs_revision";

export type MissionReview = {
  id: string;
  missionId: string;
  status: MissionReviewStatus;
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
  submittedAt: string
): Promise<MissionReview> {
  const user = auth?.currentUser;
  if (!user || !user.email) {
    throw new Error("Sign in to send this mission to your parent.");
  }
  if (user.uid !== userId) {
    throw new Error("This saved submission belongs to a different account.");
  }
  if (!user.emailVerified) {
    throw new Error("Verify the parent email before sending a mission for review.");
  }
  if (!firestore || !storage || !cloudFunctions) {
    throw new Error("Firebase mission review is not available. Please try again later.");
  }
  if (!photoUri) {
    throw new Error("The photo is missing. Take or choose a photo before sending it.");
  }
  if (!contentType.startsWith("image/")) {
    throw new Error("Choose a valid image for the mission.");
  }

  const photoResponse = await fetch(photoUri);
  if (!photoResponse.ok) {
    throw new Error("Could not read the selected photo. Please take or choose it again.");
  }
  const photoBlob = await photoResponse.blob();
  if (photoBlob.size === 0) {
    throw new Error("The selected photo is empty. Please take or choose it again.");
  }
  if (photoBlob.size > MAX_PHOTO_BYTES) {
    throw new Error("Choose a photo smaller than 5 MB.");
  }

  const storagePath = `mission-submissions/${user.uid}/${submissionId}/evidence`;
  const photoRef = ref(storage, storagePath);
  try {
    const existingPhoto = await getMetadata(photoRef);
    if (
      existingPhoto.customMetadata?.ownerUid !== user.uid ||
      existingPhoto.customMetadata?.submissionId !== submissionId ||
      existingPhoto.contentType !== contentType ||
      Number(existingPhoto.size) !== photoBlob.size
    ) {
      throw new Error("A different photo is already saved for this submission.");
    }
  } catch (error) {
    if (!isMissingStorageObject(error)) throw error;
    await uploadBytes(photoRef, photoBlob, {
      contentType,
      customMetadata: {
        ownerUid: user.uid,
        submissionId,
      },
    });
  }

  const submit = httpsCallable<
    {
      missionId: string;
      submissionId: string;
      storagePath: string;
      submittedAt: string;
    },
    SubmitMissionResponse
  >(cloudFunctions, "submitMissionForReview");
  await submit({
    missionId,
    submissionId,
    storagePath,
    submittedAt,
  });

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
