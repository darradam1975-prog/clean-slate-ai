import path from "path";
import { v4 as uuidv4 } from "uuid";
import { saveMediaFile } from "@/lib/storage";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 30;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type SavedMedia = {
  mediaType: "image" | "video";
  mediaPath: string;
  mimeType: string;
  fileSize: number;
  durationSeconds: number | null;
};

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".bin";
  }
}

export function validateMimeType(mimeType: string): "image" | "video" | null {
  if (IMAGE_TYPES.has(mimeType)) return "image";
  if (VIDEO_TYPES.has(mimeType)) return "video";
  return null;
}

export function getMediaLimits() {
  return {
    maxImageBytes: MAX_IMAGE_BYTES,
    maxVideoBytes: MAX_VIDEO_BYTES,
    maxVideoSeconds: MAX_VIDEO_SECONDS,
    allowedImageTypes: [...IMAGE_TYPES],
    allowedVideoTypes: [...VIDEO_TYPES],
  };
}

export async function saveMediaBuffer(
  buffer: Buffer,
  mimeType: string,
  durationSeconds?: number | null,
): Promise<SavedMedia> {
  const mediaType = validateMimeType(mimeType);
  if (!mediaType) {
    throw new Error("Unsupported file type. Upload an image or short video clip.");
  }

  if (mediaType === "image" && buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 15 MB or smaller.");
  }

  if (mediaType === "video") {
    if (buffer.length > MAX_VIDEO_BYTES) {
      throw new Error("Video clips must be 50 MB or smaller.");
    }
    if (durationSeconds != null && durationSeconds > MAX_VIDEO_SECONDS) {
      throw new Error("Video clips must be 30 seconds or shorter.");
    }
  }

  const filename = `${uuidv4()}${extensionForMime(mimeType)}`;
  await saveMediaFile(filename, buffer, mimeType);

  return {
    mediaType,
    mediaPath: filename,
    mimeType,
    fileSize: buffer.length,
    durationSeconds: mediaType === "video" ? (durationSeconds ?? null) : null,
  };
}

export function getUploadAbsolutePath(filename: string): string {
  return path.basename(filename);
}