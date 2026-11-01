"use client";

import { CldImage } from "next-cloudinary";

export function ProductPhoto({
  publicId,
  alt,
  sizes,
  className,
}: {
  publicId: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return <CldImage src={publicId} alt={alt} fill sizes={sizes} className={className} />;
}
