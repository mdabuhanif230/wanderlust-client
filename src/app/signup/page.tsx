"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setPending(false);

    if (error) {
      setError(error.message ?? "Could not create your account.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-normal tracking-tight text-slate-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start your adventure with Wanderlust
          </p>
        </div>

        <Card className="mt-8 rounded-lg border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleEmailSignUp} className="grid gap-5">
              <AuthInput
                id="name"
                label="Full Name"
                icon={User}
                type="text"
                name="name"
                placeholder="Enter your name"
                autoComplete="name"
                required
              />

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
                placeholder="Create a password"
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
                placeholder="Confirm your password"
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
                {pending ? "Creating account..." : "Create Account"}
              </Button>

              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400">
                  Or sign up with
                </span>
              </div>

              <GoogleButton label="Sign Up With Google" onError={setError} />

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#00A8E8] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
