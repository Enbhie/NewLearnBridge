import { auth } from "../firebase";
import { submitMissionPhotoForReview } from "./missionSubmissions";

export type MissionSubmissionStatus =
  | "saved_offline"
  | "pending_upload"
  | "uploading"
  | "submitted_successfully"
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

function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
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

async function syncUserSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener
): Promise<void> {
  if (!isOnline() || auth?.currentUser?.uid !== userId) return;

  const pending = [...submissions.values()]
    .filter(
      (submission) =>
        submission.userId === userId &&
        (submission.status === "saved_offline" ||
          submission.status === "pending_upload" ||
          submission.status === "upload_failed")
    )
    .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt));

  for (const submission of pending) {
    if (!isOnline() || auth?.currentUser?.uid !== userId) return;

    const uploading: OfflineMissionSubmission = {
      ...submission,
      status: "uploading",
      errorMessage: null,
    };
    submissions.set(submission.id, uploading);
    onStatusChange(uploading);

    try {
      await submitMissionPhotoForReview(
        submission.missionId,
        submission.fileUri,
        submission.contentType,
        submission.id,
        submission.userId,
        submission.submittedAt
      );
      const submitted: OfflineMissionSubmission = {
        ...uploading,
        status: "submitted_successfully",
      };
      submissions.set(submission.id, submitted);
      onStatusChange(submitted);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "The submission could not be uploaded.";
      const status: MissionSubmissionStatus =
        errorMessage.includes("A mission is already waiting for your parent")
          ? "pending_upload"
          : "upload_failed";
      const failed: OfflineMissionSubmission = {
        ...uploading,
        status,
        errorMessage,
      };
      submissions.set(submission.id, failed);
      onStatusChange(failed);
    }
  }
}

export function syncMissionSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener
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
    }).finally(() => {
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
