import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Access denied" };

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Icon name="shield" size={24} />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
          Access denied
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your role does not have permission to view this page. If you believe
          this is an error, contact your family office administrator.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button href="/dashboard" variant="primary" size="md">
            Return to dashboard
          </Button>
          <Button href="/login" variant="outline" size="md">
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
