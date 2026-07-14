import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/auth/AuthContext";

export default function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // AuthProvider supplies the tenant-aware (mock) user context to the shell.
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
