import { get, push, ref, set } from "firebase/database";
import type { Database, DatabaseReference } from "firebase/database";

export type MissionSubmissionRecord = {
  missionId: string;
  missionTitle: string;
  imageUrl: string;
  status: "pending";
  createdAt: number;
};

export type SavedMissionSubmissionStatus = "pending" | "approved" | "rejected";

export function createMissionSubmissionReference(
  database: Database,
  userId: string,
  submissionKey?: string
): DatabaseReference {
  const submissionsRef = ref(database, `submissions/${userId}`);
  const submissionRef = submissionKey
    ? ref(database, `submissions/${userId}/${submissionKey}`)
    : push(submissionsRef);
  if (!submissionRef.key) {
    throw new Error("Could not create a Realtime Database submission ID.");
  }
  return submissionRef;
}

export async function saveMissionSubmission(
  submissionRef: DatabaseReference,
  record: MissionSubmissionRecord
): Promise<SavedMissionSubmissionStatus> {
  const existing = await get(submissionRef);
  if (existing.exists()) {
    const saved = existing.val() as {
      missionId?: unknown;
      missionTitle?: unknown;
      imageUrl?: unknown;
      status?: unknown;
      createdAt?: unknown;
    };
    if (
      saved.missionId !== record.missionId ||
      (typeof saved.missionTitle === "string" &&
        saved.missionTitle !== record.missionTitle) ||
      saved.imageUrl !== record.imageUrl ||
      saved.createdAt !== record.createdAt
    ) {
      throw new Error("A different mission photo is already saved for this submission.");
    }
    if (
      saved.status !== "pending" &&
      saved.status !== "approved" &&
      saved.status !== "rejected"
    ) {
      throw new Error("The saved mission has an unexpected review status.");
    }
    return saved.status;
  }
  await set(submissionRef, record);
  return record.status;
}
