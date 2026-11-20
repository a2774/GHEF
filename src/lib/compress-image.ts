/** Longest side, in pixels. The store shows photos at 1920 px wide at most, so this is plenty. */
const maxEdge = 2560;
/** WebP quality: visually the same for rug photos, a fraction of the size. */
const quality = 0.86;
/** Small files are not worth the time to re-encode. */
const skipBelowBytes = 700 * 1024;

async function encodeWebp(bitmap: ImageBitmap, width: number, height: number): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.convertToBlob({ type: "image/webp", quality });
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

/**
 * Makes a big photo smaller before it is uploaded, so it goes up much faster (phone photos are
 * often 4 to 8 MB). Returns the original file when it is not a photo, is already small, or when
 * anything goes wrong, so an upload never fails because of this step.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (file.size < skipBelowBytes) return file;

  try {
    // "from-image" turns the photo the right way up, as the phone recorded it.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await encodeWebp(bitmap, width, height);
    bitmap.close();

    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
