import { Poppins } from "next/font/google";

/** The clean geometric face used on product pages, like the reference store. */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

/** Classes that switch a section, headings included, to Poppins. */
export const poppinsClass = `${poppins.variable} font-[family-name:var(--font-poppins)] [&_:is(h1,h2,h3)]:font-[family-name:var(--font-poppins)]`;
