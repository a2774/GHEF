import { Suspense } from "react";

import { AuthProvider } from "@/components/store/auth-provider";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteHeader />
      {children}
      <Suspense>
        <SiteFooter />
      </Suspense>
    </AuthProvider>
  );
}
