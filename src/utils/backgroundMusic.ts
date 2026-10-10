import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";

type BackgroundMusicPlayer = ReturnType<typeof createAudioPlayer>;

let backgroundMusic: BackgroundMusicPlayer | undefined;

export function prepareBackgroundMusic() {
  const player = createAudioPlayer(
    require("../../assets/sounds/background-music.wav")
  );
  backgroundMusic = player;
  player.loop = true;
  player.volume = 0.35;

  let isCurrent = true;
  void setAudioModeAsync({ playsInSilentMode: true })
    .then(() => {
      if (isCurrent && Platform.OS !== "web") player.play();
    })
    .catch((error: unknown) => {
      console.error("Unable to configure background music", error);
    });

  return () => {
    isCurrent = false;
    if (backgroundMusic === player) backgroundMusic = undefined;
    player.pause();
    player.remove();
  };
}

export function startBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.playing) {
    backgroundMusic.play();
  }
}
