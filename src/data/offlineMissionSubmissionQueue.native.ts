import { Directory, File, Paths } from "expo-file-system";
import { readFileAsStringAsync } from "expo-file-system";
import * as SQLite from "expo-sqlite";
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

type SubmissionRow = Omit<
  OfflineMissionSubmission,
  | "storageUploaded"
  | "cloudinaryPublicId"
  | "cloudinarySecureUrl"
  | "databaseSubmissionId"
> & {
  storageUploaded: number;
  cloudinaryPublicId: string | null;
  cloudinarySecureUrl: string | null;
  databaseSubmissionId: string | null;
};

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
          error_message TEXT,
          storage_uploaded INTEGER NOT NULL DEFAULT 0,
          storage_provider TEXT NOT NULL DEFAULT 'firebase',
          cloudinary_public_id TEXT,
          cloudinary_secure_url TEXT,
          database_submission_id TEXT
        );
        CREATE INDEX IF NOT EXISTS mission_submissions_user_date
          ON mission_submissions (user_id, submitted_at DESC);
      `);
      const columns = await database.getAllAsync<{ name: string }>(
        "PRAGMA table_info(mission_submissions)"
      );
      if (!columns.some((column) => column.name === "storage_uploaded")) {
        await database.execAsync(
          "ALTER TABLE mission_submissions ADD COLUMN storage_uploaded INTEGER NOT NULL DEFAULT -1"
        );
      }
      if (!columns.some((column) => column.name === "storage_provider")) {
        await database.execAsync(
          "ALTER TABLE mission_submissions ADD COLUMN storage_provider TEXT NOT NULL DEFAULT 'firebase'"
        );
      }
      if (!columns.some((column) => column.name === "cloudinary_public_id")) {
        await database.execAsync(
          "ALTER TABLE mission_submissions ADD COLUMN cloudinary_public_id TEXT"
        );
      }
      if (!columns.some((column) => column.name === "cloudinary_secure_url")) {
        await database.execAsync(
          "ALTER TABLE mission_submissions ADD COLUMN cloudinary_secure_url TEXT"
        );
      }
      if (!columns.some((column) => column.name === "database_submission_id")) {
        await database.execAsync(
          "ALTER TABLE mission_submissions ADD COLUMN database_submission_id TEXT"
        );
      }
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

function mapSubmissionRow(row: SubmissionRow): OfflineMissionSubmission {
  return {
    ...row,
    storageUploaded:
      row.storageUploaded === 1
        ? true
        : row.storageUploaded === 0
          ? false
          : undefined,
    storageProvider: row.storageProvider,
    cloudinaryPublicId: row.cloudinaryPublicId ?? undefined,
    cloudinarySecureUrl: row.cloudinarySecureUrl ?? undefined,
    databaseSubmissionId: row.databaseSubmissionId ?? undefined,
  };
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

  let dataUri: string | undefined;
  try {
    dataUri = await readFileAsStringAsync(durableFile.uri, {
      encoding: "base64",
    });
  } catch (error) {
    if (durableFile.exists) durableFile.delete();
    throw error;
  }

  const submission: OfflineMissionSubmission = {
    id,
    userId,
    missionId,
    fileUri: durableFile.uri,
    contentType,
    submittedAt: new Date().toISOString(),
    status: "pending_upload",
    errorMessage: null,
    storageProvider: "cloudinary",
  };

  try {
    await database.runAsync(
      `INSERT INTO mission_submissions
        (id, user_id, mission_id, file_uri, content_type, submitted_at, status, error_message, storage_uploaded, storage_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, 'cloudinary')`,
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

  return { ...submission, dataUri };
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
       error_message AS errorMessage,
       storage_uploaded AS storageUploaded,
       storage_provider AS storageProvider,
       cloudinary_public_id AS cloudinaryPublicId,
       cloudinary_secure_url AS cloudinarySecureUrl,
       database_submission_id AS databaseSubmissionId
     FROM mission_submissions
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    userId
  );
  return rows.map(mapSubmissionRow);
}

export async function markMissionSubmissionReviewed(
  submissionId: string,
  status: "approved" | "needs_revision"
): Promise<void> {
  const database = await openDatabase();
  await database.runAsync(
    "UPDATE mission_submissions SET status = ? WHERE id = ?",
    status === "approved" ? "parent_approved" : "parent_requested_retry",
    submissionId
  );
  const userId = auth?.currentUser?.uid;
  if (userId) {
    await database.runAsync(
      `UPDATE mission_submissions
       SET status = 'pending_upload', error_message = NULL
       WHERE user_id = ? AND status = 'waiting_for_parent_review'`,
      userId
    );
  }
}

async function syncUserSubmissions(
  userId: string,
  onStatusChange: StatusChangeListener,
  retryReviewEmail: boolean
): Promise<void> {
  const networkState = await Network.getNetworkStateAsync();
  if (isDefinitelyOffline(networkState)) {
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
         error_message AS errorMessage,
         storage_uploaded AS storageUploaded,
         storage_provider AS storageProvider,
         cloudinary_public_id AS cloudinaryPublicId,
         cloudinary_secure_url AS cloudinarySecureUrl,
         database_submission_id AS databaseSubmissionId
       FROM mission_submissions
       WHERE user_id = ?
         AND status IN ('saved_offline', 'pending_upload', 'upload_failed')
       ORDER BY submitted_at ASC`,
      userId
    );
    for (const row of pending) {
      const submission = mapSubmissionRow(row);
      if (auth?.currentUser?.uid !== userId) return;
      if (submission.status !== "pending_upload") {
        await database.runAsync(
          `UPDATE mission_submissions
           SET status = 'pending_upload', error_message = NULL
           WHERE id = ? AND user_id = ?`,
          submission.id,
          userId
        );
      }
      onStatusChange({
        ...submission,
        status: "pending_upload",
        errorMessage: null,
      });
    }
    return;
  }

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
       error_message AS errorMessage,
       storage_uploaded AS storageUploaded,
       storage_provider AS storageProvider,
       cloudinary_public_id AS cloudinaryPublicId,
       cloudinary_secure_url AS cloudinarySecureUrl,
       database_submission_id AS databaseSubmissionId
     FROM mission_submissions
     WHERE user_id = ?
       AND status IN (
         'saved_offline',
         'pending_upload',
         'upload_failed'
         ${retryReviewEmail ? ", 'review_email_failed'" : ""}
       )
     ORDER BY submitted_at ASC`,
    userId
  ).then((rows) => rows.map(mapSubmissionRow));

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
            await database.runAsync(
              "UPDATE mission_submissions SET storage_uploaded = -1 WHERE id = ? AND user_id = ?",
              submission.id,
              userId
            );
            storageUploaded = undefined;
          },
          onUploadProgress: (progressPercent) => {
            onStatusChange({
              ...submission,
              status: "uploading",
              errorMessage: null,
              progressPercent,
            });
          },
          onPhotoUploaded: async (uploadedPhoto) => {
            await database.runAsync(
              `UPDATE mission_submissions
               SET storage_uploaded = 1,
                   cloudinary_public_id = COALESCE(?, cloudinary_public_id),
                   cloudinary_secure_url = COALESCE(?, cloudinary_secure_url),
                   database_submission_id = COALESCE(?, database_submission_id)
               WHERE id = ? AND user_id = ?`,
              uploadedPhoto?.publicId ?? null,
              uploadedPhoto?.secureUrl ?? null,
              uploadedPhoto?.databaseSubmissionId ?? null,
              submission.id,
              userId
            );
            storageUploaded = true;
            cloudinaryPublicId = uploadedPhoto?.publicId ?? cloudinaryPublicId;
            cloudinarySecureUrl = uploadedPhoto?.secureUrl ?? cloudinarySecureUrl;
            databaseSubmissionId =
              uploadedPhoto?.databaseSubmissionId ?? databaseSubmissionId;
          },
        }
      );
      const reviewEmailError =
        "reviewEmailError" in result ? result.reviewEmailError : undefined;
      const finalStatus =
        reviewEmailError
          ? "review_email_failed"
          : result.status === "awaiting_parent_confirmation"
          ? "awaiting_parent_confirmation"
          : "submitted_successfully";
      await database.runAsync(
        `UPDATE mission_submissions
         SET status = ?, error_message = ?
         WHERE id = ? AND user_id = ?`,
        finalStatus,
         reviewEmailError ?? null,
        submission.id,
        userId
      );
      const localFile = new File(submission.fileUri);
      if (localFile.exists) localFile.delete();
      onStatusChange({
        ...submission,
        status: finalStatus,
        errorMessage: reviewEmailError ?? null,
        progressPercent: 100,
        cloudinaryPublicId,
        cloudinarySecureUrl,
        databaseSubmissionId,
      });
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
      await database.runAsync(
        `UPDATE mission_submissions
         SET status = ?, error_message = ?
         WHERE id = ? AND user_id = ?`,
        status,
        errorMessage,
        submission.id,
        userId
      );
      onStatusChange({
        ...submission,
        status,
        errorMessage,
        storageUploaded,
        cloudinaryPublicId,
        cloudinarySecureUrl,
        databaseSubmissionId,
      });
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
  const database = await openDatabase();
  const submissions = await getMissionSubmissions(userId);
  for (const submission of submissions) {
    const localFile = new File(submission.fileUri);
    if (localFile.exists) await localFile.delete();
  }
  await database.runAsync("DELETE FROM mission_submissions WHERE user_id = ?", userId);
}
