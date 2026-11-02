import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
