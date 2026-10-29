"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData.entries()) as {
      email: string;
      password: string;
    };

    const { error } = await authClient.signIn.email({
      ...user,
      rememberMe: remember,
    });

    setPending(false);

    if (error) {
      setError(error.message ?? "Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setPending(false);

    if (error) {
      setError(error.message ?? "Could not send the reset link.");
      return;
    }

    setNotice(
      "If that email exists, a reset link is on its way. (Local dev: open the link printed in the server terminal.)",
    );
  };

  const isForgot = mode === "forgot";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {isForgot ? "Forgot Password?" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isForgot
              ? "Enter your email and we'll send you a reset link"
              : "Resume your adventure with Wanderlust"}
          </p>
        </div>

        <Card className="mt-8 rounded-lg border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {!isForgot ? (
              <form onSubmit={handleEmailLogin} className="grid gap-5">
                <AuthInput
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                <AuthInput
                  id="password"
                  label="Password"
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(value) => setRemember(Boolean(value))}
                      aria-label="Remember me"
                    />
                    <span
                      className="cursor-pointer select-none"
                      onClick={() => setRemember((current) => !current)}
                    >
                      Remember me
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-sm font-medium text-[#00A8E8] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

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
                  {pending ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-slate-400">
                    Or continue with
                  </span>
                </div>

                <GoogleButton
                  label="Continue With Google"
                  onError={setError}
                />

                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-[#00A8E8] hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="grid gap-5">
                <AuthInput
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="text-sm text-green-600">
                    {notice}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 w-full bg-[#00A8E8] text-sm font-semibold text-white hover:bg-[#0095d1]"
                >
                  {pending ? "Sending..." : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-center text-sm font-medium text-[#00A8E8] hover:underline"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
