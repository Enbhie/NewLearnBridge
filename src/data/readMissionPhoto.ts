export async function readMissionPhoto(
  photoUri: string
): Promise<{ data: Blob; size: number }> {
  const response = await fetch(photoUri);
  if (!response.ok) {
    throw new Error("Could not read the selected photo. Please take or choose it again.");
  }
  const blob = await response.blob();
  return { data: blob, size: blob.size };
}
