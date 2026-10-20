import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

type BackgroundMusicPlayer = ReturnType<typeof createAudioPlayer>;
export type BackgroundMusicTrack =
  | "home"
  | "login"
  | "lesson-board"
  | "math-lesson"
  | "reading-lesson"
  | "science-lesson";

let backgroundMusic: BackgroundMusicPlayer | undefined;
let activeTrack: BackgroundMusicTrack | null = null;
let audioMode: Promise<void> | undefined;

const tracks = {
  home: require("../../assets/sounds/home-background.wav"),
  login: require("../../assets/sounds/login-background.wav"),
  "lesson-board": require("../../assets/sounds/lesson-board-background.wav"),
  "math-lesson": require("../../assets/sounds/math-lesson-background.wav"),
  "reading-lesson": require("../../assets/sounds/reading-lesson-background.wav"),
  "science-lesson": require("../../assets/sounds/science-lesson-background.wav"),
};

export function setBackgroundMusic(track: BackgroundMusicTrack | null) {
  if (activeTrack === track && (track === null || backgroundMusic)) return;

  activeTrack = track;
  backgroundMusic?.pause();
  backgroundMusic?.remove();
  backgroundMusic = undefined;

  if (!track) return;

  const player = createAudioPlayer(tracks[track]);
  backgroundMusic = player;
  player.loop = true;
  player.volume = 0.4;
  const isCurrentPlayer = () => activeTrack === track && backgroundMusic === player;

  audioMode ??= setAudioModeAsync({ playsInSilentMode: true }).catch((error: unknown) => {
    audioMode = undefined;
    throw error;
  });

  void audioMode
    .then(() => {
      if (isCurrentPlayer()) player.play();
    })
    .catch((error: unknown) => {
      if (isCurrentPlayer()) {
        console.error("Unable to start background music", error);
      }
    });
}

export function startBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.playing) {
    backgroundMusic.play();
  }
}
