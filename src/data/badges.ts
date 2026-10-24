import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";

export type EarnedBadge = {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  resultLabel: string;
  earnedAt: string;
};

const storageKey = () => `learnbridge.badges.${auth?.currentUser?.uid ?? "guest"}`;

function isEarnedBadge(value: unknown): value is EarnedBadge {
  if (typeof value !== "object" || value === null) return false;
  const badge = value as Record<string, unknown>;
  return (
    typeof badge.id === "string" &&
    typeof badge.moduleId === "string" &&
    typeof badge.title === "string" &&
    typeof badge.summary === "string" &&
    typeof badge.resultLabel === "string" &&
    typeof badge.earnedAt === "string"
  );
}

export async function getEarnedBadges(): Promise<EarnedBadge[]> {
  const raw = await AsyncStorage.getItem(storageKey());
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isEarnedBadge)) {
    throw new Error("Saved badges have an invalid format.");
  }
  return parsed;
}

export async function awardModuleBadge(input: {
  moduleId: string;
  title: string;
  summary: string;
  resultLabel: string;
}): Promise<EarnedBadge | null> {
  const existing = await getEarnedBadges();
  const duplicate = existing.find((badge) => badge.moduleId === input.moduleId);
  if (duplicate) {
    return null;
  }

  const badge: EarnedBadge = {
    id: `${input.moduleId}:${Date.now()}`,
    moduleId: input.moduleId,
    title: input.title,
    summary: input.summary,
    resultLabel: input.resultLabel,
    earnedAt: new Date().toISOString(),
  };

  const next = [badge, ...existing];
  await AsyncStorage.setItem(storageKey(), JSON.stringify(next));
  return badge;
}
