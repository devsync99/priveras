import { ResetPasswordForm } from "./reset-password-form";
import { resetPassword, verifyPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetConfirmationEmail } from "@/lib/email";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Invalid Reset Link
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This password reset link is invalid or missing. Please request a
                new one.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verify token validity
  const verification = await verifyPasswordResetToken(token);

  if (verification.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {verification.error}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {verification.error.includes("expired")
                  ? "This reset link has expired. Please request a new one."
                  : "Please request a new password reset link."}
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleResetPassword(formData: FormData) {
    "use server";

    const password = formData.get("password") as string;
    const resetToken = formData.get("token") as string;

    if (!password || !resetToken) {
      return { error: "Missing required fields" };
    }

    const result = await resetPassword(resetToken, password);

    if (result.error) {
      return { error: result.error };
    }

    if (result.success && result.user) {
      // Send confirmation email
      await sendPasswordResetConfirmationEmail(
        result.user.email,
        result.user.name || undefined
      );
    }

    return { success: true };
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Almost There!
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Create a strong password to secure your account
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-400 shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Strong Password</h3>
                  <p className="text-indigo-200">
                    Use a mix of letters, numbers, and symbols
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-400 shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Secure & Encrypted</h3>
                  <p className="text-indigo-200">
                    Your password is hashed and securely stored
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-400 shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Instant Access</h3>
                  <p className="text-indigo-200">
                    Sign in immediately after resetting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <ResetPasswordForm
          handleResetPassword={handleResetPassword}
          token={token}
        />
      </div>
    </div>
  );
}
