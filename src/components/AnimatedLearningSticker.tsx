import { Image } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

const stickers = {
  owl: require("../../assets/images/learning/learning-owl.gif"),
  plant: require("../../assets/images/learning/learning-plant.gif"),
  coin: require("../../assets/images/learning/learning-coin.gif"),
};

const stickerColors = {
  owl: { backgroundColor: "#DDF5F1", borderColor: "#9DD8D1" },
  plant: { backgroundColor: "#D5F5E7", borderColor: "#9CCDBA" },
  coin: { backgroundColor: "#FFF0AA", borderColor: "#F3C451" },
};

export type LearningStickerVariant = keyof typeof stickers;
const stickerVariants: LearningStickerVariant[] = ["owl", "plant", "coin"];

export function learningStickerVariantForIndex(
  index: number
): LearningStickerVariant {
  return stickerVariants[index % stickerVariants.length];
}

type Props = {
  variant: LearningStickerVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function AnimatedLearningSticker({
  variant,
  size = 64,
  style,
}: Props) {
  return (
    <Image
      accessibilityLabel={`${variant} learning animation`}
      autoplay
      contentFit="contain"
      source={stickers[variant]}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          ...stickerColors[variant],
        },
        style,
      ]}
    />
  );
}
