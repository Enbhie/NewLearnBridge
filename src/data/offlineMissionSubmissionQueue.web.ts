import * as Network from "expo-network";
import { auth } from "../firebase";
import { isDefinitelyOffline } from "../utils/internetConnectivity";
import { submitMissionPhotoForReview } from "./missionSubmissions";

export type MissionSubmissionStatus =
  | "saved_offline"
  | "pending_upload"
  | "uploading"
  | "submitted_successfully"
  | "uploaded_to_cloudinary"
  | "awaiting_parent_confirmation"
  | "review_email_failed"
  | "waiting_for_parent_review"
  | "parent_approved"
  | "parent_requested_retry"
  | "upload_failed";

export type OfflineMissionSubmission = {
  id: string;
  userId: string;
  missionId: string;
  fileUri: string;
  contentType: string;
  submittedAt: string;
  status: MissionSubmissionStatus;
  errorMessage: string | null;
  progressPercent?: number;
  storageUploaded?: boolean;
  storageProvider: "firebase" | "cloudinary";
  cloudinaryPublicId?: string;
  cloudinarySecureUrl?: string;
  databaseSubmissionId?: string;
};

const submissions = new Map<string, OfflineMissionSubmission>();
type StatusChangeListener = (submission: OfflineMissionSubmission) => void;
type SyncJob = {
  listeners: Set<StatusChangeListener>;
  promise: Promise<void>;
};
const syncPromises = new Map<string, SyncJob>();

function createSubmissionId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
    .padEnd(20, "0")
    .slice(0, 20);
}

export async function saveMissionPhotoSubmission(
  userId: string,
  missionId: string,
  sourceUri: string,
  contentType: string
): Promise<OfflineMissionSubmission> {
  if (!userId || auth?.currentUser?.uid !== userId) {
    throw new Error("Sign in again before saving this mission submission.");
  }
  if (!sourceUri) throw new Error("Choose a photo before submitting this mission.");
  if (!contentType.startsWith("image/")) {
    throw new Error("Choose a valid image for the mission.");
  }

  const submission: OfflineMissionSubmission = {
    id: createSubmissionId(),
    userId,
    missionId,
    fileUri: sourceUri,
    contentType,
    submittedAt: new Date().toISOString(),
    status: "pending_upload",
    errorMessage: null,
    storageUploaded: false,
    storageProvider: "cloudinary",
  };
  submissions.set(submission.id, submission);
  return submission;
}

export async function getMissionSubmissions(
  userId: string
): Promise<OfflineMissionSubmission[]> {
  return [...submissions.values()]
    .filter((submission) => submission.userId === userId)
    .sort((first, second) => second.submittedAt.localeCompare(first.submittedAt));
}

export async function markMissionSubmissionReviewed(
  submissionId: string,
  status: "approved" | "needs_revision"
): Promise<void> {
  const submission = submissions.get(submissionId);
  if (!submission) return;
  submissions.set(submissionId, {
    ...submission,
    status: status === "approved" ? "parent_approved" : "parent_requested_retry",
  });
  const userId = auth?.currentUser?.uid;
  if (userId) {
    for (const [id, queued] of submissions) {
      if (queued.userId === userId && queued.status === "waiting_for_parent_review") {
        submissions.set(id, {
          ...queued,
          status: "pending_upload",
          errorMessage: null,
        });
      }
    }
  }
}

async function syncUserSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener,
  retryReviewEmail: boolean
): Promise<void> {
  if (auth?.currentUser?.uid !== userId) return;
  const networkState = await Network.getNetworkStateAsync();
  if (isDefinitelyOffline(networkState)) {
    for (const submission of submissions.values()) {
      if (
        submission.userId !== userId ||
        !["saved_offline", "pending_upload", "upload_failed"].includes(submission.status)
      ) {
        continue;
      }
      const pending: OfflineMissionSubmission = {
        ...submission,
        status: "pending_upload",
        errorMessage: null,
      };
      submissions.set(submission.id, pending);
      onStatusChange(pending);
    }
    return;
  }

  const pending = [...submissions.values()]
    .filter(
      (submission) =>
        submission.userId === userId &&
        (submission.status === "saved_offline" ||
          submission.status === "pending_upload" ||
          submission.status === "upload_failed" ||
          (retryReviewEmail && submission.status === "review_email_failed"))
    )
    .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt));

  for (const submission of pending) {
    if (auth?.currentUser?.uid !== userId) return;

    const uploading: OfflineMissionSubmission = {
      ...submission,
      status: "uploading",
      errorMessage: null,
    };
    submissions.set(submission.id, uploading);
    onStatusChange(uploading);

    let storageUploaded = submission.storageUploaded;
    let cloudinaryPublicId = submission.cloudinaryPublicId;
    let cloudinarySecureUrl = submission.cloudinarySecureUrl;
    let databaseSubmissionId = submission.databaseSubmissionId;
    try {
      const result = await submitMissionPhotoForReview(
        submission.missionId,
        submission.fileUri,
        submission.contentType,
        submission.id,
        submission.userId,
        submission.submittedAt,
        {
          storageUploaded,
          storageProvider: submission.storageProvider,
          cloudinaryPublicId,
          cloudinarySecureUrl,
          databaseSubmissionId,
          onUploadStarted: async () => {
            storageUploaded = undefined;
            const starting: OfflineMissionSubmission = {
              ...uploading,
              storageUploaded: undefined,
            };
            submissions.set(submission.id, starting);
            onStatusChange(starting);
          },
          onUploadProgress: (progressPercent) => {
            const progress: OfflineMissionSubmission = {
              ...uploading,
              progressPercent,
            };
            submissions.set(submission.id, progress);
            onStatusChange(progress);
          },
          onPhotoUploaded: async (uploadedPhoto) => {
            storageUploaded = true;
            cloudinaryPublicId = uploadedPhoto?.publicId ?? cloudinaryPublicId;
            cloudinarySecureUrl = uploadedPhoto?.secureUrl ?? cloudinarySecureUrl;
            databaseSubmissionId =
              uploadedPhoto?.databaseSubmissionId ?? databaseSubmissionId;
            const uploaded: OfflineMissionSubmission = {
              ...uploading,
              storageUploaded: true,
              cloudinaryPublicId,
              cloudinarySecureUrl,
              databaseSubmissionId,
            };
            submissions.set(submission.id, uploaded);
            onStatusChange(uploaded);
          },
        }
      );
      const reviewEmailError =
        "reviewEmailError" in result ? result.reviewEmailError : undefined;
      const submitted: OfflineMissionSubmission = {
        ...uploading,
        status: reviewEmailError
          ? "review_email_failed"
          : result.status === "awaiting_parent_confirmation"
            ? "awaiting_parent_confirmation"
            : "submitted_successfully",
        errorMessage: reviewEmailError ?? null,
        progressPercent: 100,
        cloudinaryPublicId,
        cloudinarySecureUrl,
        databaseSubmissionId,
      };
      submissions.set(submission.id, submitted);
      onStatusChange(submitted);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "The submission could not be uploaded.";
      const waitingForReview = errorMessage.includes(
        "A mission is already waiting for your parent"
      );
      const status: MissionSubmissionStatus = waitingForReview
        ? "waiting_for_parent_review"
        : "upload_failed";
      const failed: OfflineMissionSubmission = {
        ...uploading,
        status,
        errorMessage,
        storageUploaded,
        cloudinaryPublicId,
        cloudinarySecureUrl,
        databaseSubmissionId,
      };
      submissions.set(submission.id, failed);
      onStatusChange(failed);
      if (waitingForReview) return;
    }
  }
}

export function syncMissionSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener,
  options: { retryReviewEmail?: boolean } = {}
): Promise<void> {
  let job = syncPromises.get(userId);
  if (!job) {
    const listeners = new Set<StatusChangeListener>([onStatusChange]);
    const newJob: SyncJob = {
      listeners,
      promise: Promise.resolve(),
    };
    newJob.promise = syncUserSubmissions(userId, (submission) => {
      for (const listener of [...listeners]) {
        try {
          listener(submission);
        } catch (error) {
          console.error("Mission submission status listener failed.", error);
        }
      }
    }, options.retryReviewEmail === true).finally(() => {
      if (syncPromises.get(userId) === newJob) syncPromises.delete(userId);
    });
    syncPromises.set(userId, newJob);
    job = newJob;
  } else {
    job.listeners.add(onStatusChange);
  }

  return job.promise.finally(() => {
    job?.listeners.delete(onStatusChange);
  });
}

export async function deleteMissionSubmissionsForUser(userId: string): Promise<void> {
  for (const [id, submission] of submissions) {
    if (submission.userId === userId) submissions.delete(id);
  }
}
