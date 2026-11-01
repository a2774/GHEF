import { createHash } from "node:crypto";

export const productImageFolder = "ganga-handmade-export/products";

function getConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured. Set the Cloudinary values in .env.local.");
  }
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function createUploadSignature() {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = sign({ folder: productImageFolder, timestamp }, apiSecret);
  return { cloudName, apiKey, timestamp, folder: productImageFolder, signature };
}

export function isOwnProductImage(publicId: string, url: string) {
  const { cloudName } = getConfig();
  return (
    publicId.startsWith(`${productImageFolder}/`) &&
    url.startsWith(`https://res.cloudinary.com/${cloudName}/`)
  );
}

export async function destroyImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature: sign({ public_id: publicId, timestamp }, apiSecret),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const result = (await response.json().catch(() => null)) as { result?: string } | null;
  if (result?.result !== "ok" && result?.result !== "not found") {
    throw new Error(`Cloudinary could not delete ${publicId}.`);
  }
}
