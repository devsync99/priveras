import { redirect } from "next/navigation";
import { getSession, signup } from "@/lib/session";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const session = await getSession();

  // If already logged in, redirect to home
  if (session) {
    redirect("/");
  }

  async function handleSignup(formData: FormData) {
    "use server";

    const result = await signup(formData);

    if (result?.error) {
      return { error: result.error };
    }

    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm handleSignup={handleSignup} />
    </div>
  );
}
