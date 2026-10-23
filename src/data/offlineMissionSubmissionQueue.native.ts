import { Directory, File, Paths } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { auth } from "../firebase";
import { checkInternetConnectivity } from "../utils/internetConnectivity";
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

type SubmissionRow = OfflineMissionSubmission;

const DATABASE_NAME = "learnbridge-mission-submissions.db";
const PHOTO_DIRECTORY = new Directory(Paths.document, "mission-submissions");
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
type StatusChangeListener = (submission: OfflineMissionSubmission) => void;
type SyncJob = {
  listeners: Set<StatusChangeListener>;
  promise: Promise<void>;
};
const syncPromises = new Map<string, SyncJob>();

function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS mission_submissions (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          mission_id TEXT NOT NULL,
          file_uri TEXT NOT NULL,
          content_type TEXT NOT NULL,
          submitted_at TEXT NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT
        );
        CREATE INDEX IF NOT EXISTS mission_submissions_user_date
          ON mission_submissions (user_id, submitted_at DESC);
      `);
      await database.runAsync(
        `UPDATE mission_submissions
         SET status = 'pending_upload'
         WHERE status = 'uploading'`
      );
      return database;
    })().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

function createSubmissionId(): string {
  const randomPart = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}${randomPart}`.padEnd(20, "0").slice(0, 20);
}

function getPhotoExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  const extension = extensions[contentType.toLowerCase()];
  if (!extension) throw new Error("Choose a supported photo file before submitting.");
  return extension;
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

  const extension = getPhotoExtension(contentType);
  const source = new File(sourceUri);
  if (!source.exists || source.size <= 0) {
    throw new Error("The selected photo is no longer available. Choose it again.");
  }
  if (source.size > MAX_PHOTO_BYTES) {
    throw new Error("Choose a photo smaller than 5 MB.");
  }

  const database = await openDatabase();
  if (!PHOTO_DIRECTORY.exists) {
    PHOTO_DIRECTORY.create({ idempotent: true, intermediates: true });
  }

  const id = createSubmissionId();
  const durableFile = new File(PHOTO_DIRECTORY, `${id}.${extension}`);
  await source.copy(durableFile);

  const submission: OfflineMissionSubmission = {
    id,
    userId,
    missionId,
    fileUri: durableFile.uri,
    contentType,
    submittedAt: new Date().toISOString(),
    status: "pending_upload",
    errorMessage: null,
  };

  try {
    await database.runAsync(
      `INSERT INTO mission_submissions
        (id, user_id, mission_id, file_uri, content_type, submitted_at, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
      submission.id,
      submission.userId,
      submission.missionId,
      submission.fileUri,
      submission.contentType,
      submission.submittedAt,
      submission.status
    );
  } catch (error) {
    if (durableFile.exists) durableFile.delete();
    throw error;
  }

  return submission;
}

export async function getMissionSubmissions(
  userId: string
): Promise<OfflineMissionSubmission[]> {
  const database = await openDatabase();
  const rows = await database.getAllAsync<SubmissionRow>(
    `SELECT
       id,
       user_id AS userId,
       mission_id AS missionId,
       file_uri AS fileUri,
       content_type AS contentType,
       submitted_at AS submittedAt,
       status,
       error_message AS errorMessage
     FROM mission_submissions
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    userId
  );
  return rows;
}

async function syncUserSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener
): Promise<void> {
  if (!(await checkInternetConnectivity())) return;

  const database = await openDatabase();
  const pending = await database.getAllAsync<SubmissionRow>(
    `SELECT
       id,
       user_id AS userId,
       mission_id AS missionId,
       file_uri AS fileUri,
       content_type AS contentType,
       submitted_at AS submittedAt,
       status,
       error_message AS errorMessage
     FROM mission_submissions
     WHERE user_id = ?
       AND status IN ('saved_offline', 'pending_upload', 'upload_failed')
     ORDER BY submitted_at ASC`,
    userId
  );

  for (const submission of pending) {
    if (auth?.currentUser?.uid !== userId) return;

    await database.runAsync(
      `UPDATE mission_submissions
       SET status = 'uploading', error_message = NULL
       WHERE id = ? AND user_id = ? AND status != 'submitted_successfully'`,
      submission.id,
      userId
    );
    onStatusChange({ ...submission, status: "uploading", errorMessage: null });

    try {
      await submitMissionPhotoForReview(
        submission.missionId,
        submission.fileUri,
        submission.contentType,
        submission.id,
        submission.userId,
        submission.submittedAt
      );
      await database.runAsync(
        `UPDATE mission_submissions
         SET status = 'submitted_successfully', error_message = NULL
         WHERE id = ? AND user_id = ?`,
        submission.id,
        userId
      );
      const localFile = new File(submission.fileUri);
      if (localFile.exists) localFile.delete();
      onStatusChange({
        ...submission,
        status: "submitted_successfully",
        errorMessage: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "The submission could not be uploaded.";
      const waitingForReview =
        errorMessage.includes("A mission is already waiting for your parent");
      const status: MissionSubmissionStatus = waitingForReview
        ? "pending_upload"
        : "upload_failed";
      await database.runAsync(
        `UPDATE mission_submissions
         SET status = ?, error_message = ?
         WHERE id = ? AND user_id = ?`,
        status,
        errorMessage,
        submission.id,
        userId
      );
      onStatusChange({ ...submission, status, errorMessage });
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
  const database = await openDatabase();
  const submissions = await getMissionSubmissions(userId);
  for (const submission of submissions) {
    const localFile = new File(submission.fileUri);
    if (localFile.exists) await localFile.delete();
  }
  await database.runAsync("DELETE FROM mission_submissions WHERE user_id = ?", userId);
}
