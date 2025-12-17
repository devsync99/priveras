import { ForgotPasswordForm } from "./forgot-password-form";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
  const session = await getSession();

  // If already logged in, redirect to home
  if (session) {
    redirect("/");
  }

  async function handleForgotPassword(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Email is required" };
    }

    const result = await createPasswordResetToken(email);

    if (result.error) {
      // For security, don't reveal if email exists or not
      // Always return success to prevent email enumeration
      return { success: true };
    }

    if (result.token && result.user) {
      await sendPasswordResetEmail(
        email,
        result.token,
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
              Secure Account Recovery
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Reset your password securely with our encrypted recovery process
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
                  <h3 className="font-semibold text-lg">Secure Process</h3>
                  <p className="text-indigo-200">
                    Time-limited reset links for your protection
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-lg">Email Verification</h3>
                  <p className="text-indigo-200">
                    Reset link sent directly to your inbox
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
                  <h3 className="font-semibold text-lg">Quick Recovery</h3>
                  <p className="text-indigo-200">
                    Get back to your account in minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <ForgotPasswordForm handleForgotPassword={handleForgotPassword} />
      </div>
    </div>
  );
}
