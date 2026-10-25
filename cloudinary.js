import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";

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
      "Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET, then restart the app."
    );
  }

  const contentType = options.contentType ?? "image/jpeg";
  const fileName = options.fileName ?? "mission.jpg";
  const form = new FormData();

  if (Platform.OS === "web") {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) {
      throw new Error("Could not read the selected photo. Please choose it again.");
    }
    form.append("file", await fileResponse.blob(), fileName);
  } else {
    form.append("file", { uri, type: contentType, name: fileName });
  }

  form.append("upload_preset", uploadPreset);

  const uploadFetch = Platform.OS === "web" ? fetch : expoFetch;
  const response = await uploadFetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data.error?.message === "string" ? data.error.message : "";
    if (/upload preset.*not found/i.test(message)) {
      throw new Error(
        `Cloudinary upload preset "${uploadPreset}" was not found in cloud "${cloudName}". Create or select an unsigned upload preset in that Cloudinary account and restart the app.`
      );
    }
    throw new Error(`Cloudinary upload failed (${response.status}): ${message || response.statusText}`);
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
