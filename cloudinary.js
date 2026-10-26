import { Platform } from "react-native";
import { readFileAsStringAsync } from "expo-file-system";

/**
 * @param {string} uri
 * @param {{ contentType?: string; fileName?: string }} [options]
 * @returns {Promise<{ publicId: string; secureUrl: string }>}
 */
export async function uploadToCloudinary(uri, options = {}) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in the EAS environment, then rebuild the app."
    );
  }
  if (!uri) {
    throw new Error("No photo selected.");
  }

  const contentType = options.contentType ?? "image/jpeg";
  const fileName = options.fileName ?? "mission.jpg";

  let filePart;
  if (Platform.OS === "web") {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) {
      throw new Error("Could not read the selected photo. Please choose it again.");
    }
    filePart = await fileResponse.blob();
  } else {
    const fileContent = await readFileAsStringAsync(uri, {
      encoding: "base64",
    });
    filePart = new File([fileContent], fileName, { type: contentType });
  }

  const form = new FormData();
  form.append("file", filePart);
  form.append("upload_preset", uploadPreset);

  // Use the global fetch on all platforms. Do NOT set Content-Type manually.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.error?.message === "string" ? data.error.message : "";
    if (/upload preset.*not found/i.test(message)) {
      throw new Error(
        `Cloudinary upload preset "${uploadPreset}" was not found in cloud "${cloudName}". Create or select an unsigned upload preset in that Cloudinary account.`
      );
    }
    throw new Error(
      `Cloudinary upload failed (${response.status}): ${message || response.statusText}`
    );
  }
  if (
    typeof data.secure_url !== "string" ||
    !data.secure_url.startsWith(
      `https://res.cloudinary.com/${cloudName}/image/upload/`
    ) ||
    typeof data.public_id !== "string" ||
    data.public_id.length === 0
  ) {
    throw new Error("Cloudinary returned an invalid upload result.");
  }
  return { publicId: data.public_id, secureUrl: data.secure_url };
}