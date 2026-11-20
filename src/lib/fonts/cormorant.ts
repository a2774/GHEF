import { Cormorant_Garamond } from "next/font/google";

// Cormorant only styles headings and names further down the home page, so it is not preloaded.

/** The elegant serif used for the "Explore the collections" heading and card names. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  preload: false,
});
