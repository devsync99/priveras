"use client";

import { ArrowRight, Loader2, Mail, Check } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  handleForgotPassword: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean } | void>;
}

export function ForgotPasswordForm({
  handleForgotPassword,
}: ForgotPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await handleForgotPassword(formData);

      if (result?.error) {
        toast.error("Error", {
          description: result.error,
        });
      } else if (result?.success) {
        setEmailSent(true);
        toast.success("Email Sent!", {
          description: "Check your inbox for password reset instructions.",
        });
      }
    });
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 px-8 py-10">
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white text-center">
              Check Your Email
            </h2>
            <p className="text-green-100 text-center mt-2 text-sm">
              Password reset instructions sent
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  We've sent password reset instructions to
                </p>
                <p className="font-semibold text-green-900 mt-1">{email}</p>
              </div>

              <div className="text-sm text-gray-600 space-y-2 text-left">
                <p className="font-medium text-gray-900">What's next?</p>
                <ul className="space-y-2 ml-4 list-disc">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new strong password</li>
                  <li>Sign in with your new password</li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-500">
                  Didn't receive the email?{" "}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-10">
          <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white text-center">
            Forgot Password?
          </h2>
          <p className="text-indigo-100 text-center mt-2 text-sm">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
                disabled={isPending}
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter the email address associated with your account
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
