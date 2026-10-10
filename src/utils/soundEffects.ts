import { createAudioPlayer } from "expo-audio";

export type FeedbackKind = "tap" | "select" | "open" | "success" | "celebrate" | "error";

const soundFiles: Record<FeedbackKind, number> = {
  tap: require("../../assets/sounds/select-button.wav"),
  select: require("../../assets/sounds/select-button.wav"),
  open: require("../../assets/sounds/select-button.wav"),
  success: require("../../assets/sounds/kids-cheer.wav"),
  celebrate: require("../../assets/sounds/kids-cheer.wav"),
  error: require("../../assets/sounds/wrong-answer.mp3"),
};

const playerCache = new Map<FeedbackKind, ReturnType<typeof createAudioPlayer>>();

export function playFeedback(kind: FeedbackKind = "tap") {
  try {
    const player = playerCache.get(kind) ?? createAudioPlayer(soundFiles[kind]);
    playerCache.set(kind, player);
    player.volume = 0.75;
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.error(`Unable to play ${kind} sound effect`, error);
  }
}
