"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { AuthInput } from "@/components/auth/AuthInput";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const expired = params.get("error") === "INVALID_TOKEN";

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    const { error } = await authClient.resetPassword({
      token: token ?? "",
      newPassword,
    });

    setPending(false);

    if (error) {
      setError(error.message ?? "Could not reset the password. Try again.");
      return;
    }

    setDone(true);
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {done ? "All Set!" : "Reset Password"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {done
            ? "Your password has been updated"
            : "Choose a new password for your account"}
        </p>
      </div>

      <Card className="mt-8 rounded-lg border-slate-200 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          {!token || expired ? (
            <div className="grid gap-5 text-center">
              <p role="alert" className="text-sm text-destructive">
                {expired
                  ? "This reset link has expired or was already used."
                  : "This reset link is invalid. Please request a new one."}
              </p>
              <Link href="/login">
                <Button
                  type="button"
                  className="h-11 w-full bg-[#00A8E8] text-sm font-semibold text-white hover:bg-[#0095d1]"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : done ? (
            <div className="grid gap-5 text-center">
              <p role="status" className="text-sm text-green-600">
                Password updated. You can sign in with your new password.
              </p>
              <Link href="/login">
                <Button
                  type="button"
                  className="h-11 w-full bg-[#00A8E8] text-sm font-semibold text-white hover:bg-[#0095d1]"
                >
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="grid gap-5">
              <AuthInput
                id="newPassword"
                label="New Password"
                icon={Lock}
                type="password"
                name="newPassword"
                placeholder="Create a new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <AuthInput
                id="confirmPassword"
                label="Confirm Password"
                icon={Lock}
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="h-11 w-full bg-[#00A8E8] text-sm font-semibold text-white hover:bg-[#0095d1]"
              >
                {pending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <p className="text-center text-sm text-slate-500">Loading...</p>
          }
        >
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
