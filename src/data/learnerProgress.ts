import { deleteDoc, doc, runTransaction } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

export type LearnerProgress = {
  completedLessonIds: string[];
  mistakeCounts: Record<string, number>;
};

function isProgressRecord(value: unknown): value is LearnerProgress {
  if (!value || typeof value !== "object") return false;
  const progress = value as Record<string, unknown>;
  return (
    Array.isArray(progress.completedLessonIds) &&
    progress.completedLessonIds.every((id) => typeof id === "string") &&
    typeof progress.mistakeCounts === "object" &&
    progress.mistakeCounts !== null &&
    !Array.isArray(progress.mistakeCounts) &&
    Object.values(progress.mistakeCounts).every(
      (count) => typeof count === "number" && Number.isInteger(count) && count >= 0
    )
  );
}

function mergeProgress(
  local: LearnerProgress,
  remote: LearnerProgress
): LearnerProgress {
  const mistakeCounts = { ...remote.mistakeCounts };
  for (const [lessonId, count] of Object.entries(local.mistakeCounts)) {
    mistakeCounts[lessonId] = Math.max(mistakeCounts[lessonId] ?? 0, count);
  }
  return {
    completedLessonIds: [
      ...new Set([...remote.completedLessonIds, ...local.completedLessonIds]),
    ],
    mistakeCounts,
  };
}

export async function syncLearnerProgress(
  database: Firestore,
  userId: string,
  profileId: string,
  localProgress: LearnerProgress
): Promise<LearnerProgress> {
  const progressRef = doc(database, "users", userId, "learnerProgress", profileId);
  return runTransaction(database, async (transaction) => {
    const snapshot = await transaction.get(progressRef);
    let remoteProgress: LearnerProgress = {
      completedLessonIds: [],
      mistakeCounts: {},
    };
    if (snapshot.exists()) {
      const stored = snapshot.data();
      if (!isProgressRecord(stored)) {
        throw new Error("Saved cloud learning progress has an invalid format.");
      }
      remoteProgress = stored;
    }

    const merged = mergeProgress(localProgress, remoteProgress);
    if (
      !snapshot.exists() ||
      JSON.stringify(merged) !==
        JSON.stringify({
          completedLessonIds: remoteProgress.completedLessonIds,
          mistakeCounts: remoteProgress.mistakeCounts,
        })
    ) {
      transaction.set(progressRef, merged);
    }
    return merged;
  });
}

export async function deleteLearnerProgress(
  database: Firestore,
  userId: string,
  profileId: string
): Promise<void> {
  await deleteDoc(doc(database, "users", userId, "learnerProgress", profileId));
}
