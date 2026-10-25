import { File } from "expo-file-system";

export async function readMissionPhoto(
  photoUri: string
): Promise<{ data: File; size: number }> {
  const file = new File(photoUri);
  if (!file.exists) {
    throw new Error("Could not read the selected photo. Please take or choose it again.");
  }
  return { data: file, size: file.size };
}
