import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue to-brand-green text-white shadow-sm">
            <Icon name="shield" size={24} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            Family Wealth OS
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to the V J Desai Family command centre
          </p>
        </div>

        <div className="rounded-xl2 border border-line bg-white p-6 shadow-card">
          <div className="mb-5 rounded-lg border border-dashed border-line bg-slate-50 px-4 py-3 text-xs leading-relaxed text-muted">
            Development preview — authentication is not enabled yet. No passwords
            or credentials are entered or stored.
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                type="email"
                disabled
                placeholder="you@vjdesai.com"
                className="h-10 w-full rounded-lg border border-line bg-slate-50 px-3 text-sm text-ink placeholder:text-muted"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-line bg-slate-50 px-3 text-sm text-ink placeholder:text-muted"
              />
            </div>
            <Button
              href="/dashboard"
              variant="primary"
              size="md"
              className="w-full"
            >
              Continue to dashboard
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Mock authentication for development only. Signed in as Family Admin.
        </p>
      </div>
    </div>
  );
}
