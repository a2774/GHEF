import { oswald } from "@/lib/fonts/oswald";

const sizes = {
  large: "text-3xl sm:text-4xl",
  small: "text-2xl sm:text-3xl",
} as const;

const tones = {
  dark: "text-[#4a4a4a]",
  /** For the dark footer. */
  light: "text-white",
} as const;

/**
 * The one heading style for the sections of the storefront home page: centred, tall bold capitals
 * with a little space between the letters, like "BESTSELLERS". A full stop at the end of the text
 * is dropped. The font is set on the heading itself, because the global heading font would
 * override one inherited from a parent.
 */
export function SectionHeading({
  children,
  size = "large",
  tone = "dark",
  className = "",
}: {
  children: string;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <h2
      className={`${oswald.variable} text-center font-[family-name:var(--font-oswald)] font-semibold tracking-[0.08em] text-balance uppercase ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children.replace(/\.$/, "")}
    </h2>
  );
}
