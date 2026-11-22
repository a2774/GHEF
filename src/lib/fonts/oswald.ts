import { Oswald } from "next/font/google";

// Oswald only styles headings further down the page, so it is not preloaded: the browser fetches
// it when the text is drawn, and the first screen does not wait behind it.

/** The tall, semibold face used for the product row headings such as "BESTSELLERS". */
export const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-oswald",
  preload: false,
});
