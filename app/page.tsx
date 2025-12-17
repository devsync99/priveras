// app/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // If logged in, redirect to dashboard
  redirect("/dashboard");
}
