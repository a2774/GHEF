import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Admin login</h1>
        <p className="mt-1 text-base text-muted-foreground">Ganga Handmade Export</p>
        <LoginForm />
      </div>
    </main>
  );
}
