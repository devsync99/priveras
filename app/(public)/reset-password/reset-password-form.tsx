"use client";

import { ArrowRight, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  handleResetPassword: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean } | void>;
  token: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
}

export function ResetPasswordForm({
  handleResetPassword,
  token,
}: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    const score = [
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      score,
    };
  };

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordValid = passwordStrength.score >= 4;
  const passwordsMatch = password === confirmPassword;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isPasswordValid && password) {
      toast.error("Weak Password", {
        description:
          "Please create a stronger password with at least 4 of the required criteria.",
      });
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords Don't Match", {
        description: "Please make sure both password fields match.",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("token", token);

    startTransition(async () => {
      const result = await handleResetPassword(formData);

      if (result?.error) {
        toast.error("Reset Failed", {
          description: result.error,
        });
      } else if (result?.success) {
        setResetSuccess(true);
        toast.success("Password Reset!", {
          description: "Your password has been successfully changed.",
        });
      }
    });
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score === 3) return "bg-amber-500";
    if (passwordStrength.score === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score === 3) return "Fair";
    if (passwordStrength.score === 4) return "Good";
    return "Strong";
  };

  if (resetSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 px-8 py-10">
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white text-center">
              Password Reset Successful!
            </h2>
            <p className="text-green-100 text-center mt-2 text-sm">
              You can now sign in with your new password
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Your password has been changed successfully. You can now use
                  your new password to sign in to your account.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                Go to Sign In
                <ArrowRight className="w-5 h-5" />
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
            <svg
              className="w-7 h-7 text-white"
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
          </div>
          <h2 className="text-3xl font-bold text-white text-center">
            Reset Your Password
          </h2>
          <p className="text-indigo-100 text-center mt-2 text-sm">
            Create a strong new password for your account
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-10">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Create a strong password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-3 space-y-3">
                  {/* Password strength bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password strength</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength.score <= 2
                            ? "text-red-600"
                            : passwordStrength.score === 3
                            ? "text-amber-600"
                            : passwordStrength.score === 4
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Password requirements checklist */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Password must contain:
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.hasMinLength ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.hasMinLength
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.hasUpperCase ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.hasUpperCase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.hasLowerCase ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.hasLowerCase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.hasNumber ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.hasNumber
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.hasSpecialChar ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.hasSpecialChar
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Re-enter your password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">
                        Passwords don't match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isPending || !isPasswordValid || !passwordsMatch || !password
              }
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting password...
                </>
              ) : (
                <>
                  Reset Password
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
