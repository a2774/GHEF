import { Suspense } from "react";

import { AuthProvider } from "@/components/store/auth-provider";
import { Deferred } from "@/components/store/deferred";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteHeader />
      {children}
      <Deferred height={520}>
        <Suspense>
          <SiteFooter />
        </Suspense>
      </Deferred>
    </AuthProvider>
  );
}
