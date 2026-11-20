import { preload } from "react-dom";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Cloudinary makes each size on request (and picks WebP or AVIF for the browser), so the page only
// has to say which widths it can use. `c_limit` never makes a picture bigger than the original.
const widths = [256, 384, 640, 750, 1080, 1600, 2048] as const;

function photoUrl(publicId: string, width: number) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_${width},f_auto,q_auto/${publicId}`;
}

/**
 * A product photo from Cloudinary that fills its (relative) parent. It is plain HTML with no
 * client JavaScript, so a page with many photos has nothing extra to hydrate.
 *
 * `priority` is for the one photo that is the biggest thing on screen when the page opens: it is
 * fetched at once and first. `lowPriority` is for photos that are probably off screen, such as
 * the other slides of a gallery, so they do not slow the first one down.
 */
export function ProductPhoto({
  publicId,
  alt,
  sizes,
  className = "",
  priority = false,
  lowPriority = false,
}: {
  publicId: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  lowPriority?: boolean;
}) {
  const srcSet = widths.map((width) => `${photoUrl(publicId, width)} ${width}w`).join(", ");
  const src = photoUrl(publicId, 750);

  if (priority) {
    preload(src, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });
  }

  return (
    // A plain <img> on purpose: Cloudinary already resizes and converts the picture.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : lowPriority ? "low" : "auto"}
      className={`absolute inset-0 size-full ${className}`}
    />
  );
}
