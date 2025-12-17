// app/page.tsx
import { redirect } from "next/navigation";
import { getSession, logout } from "@/lib/session";
import { UserInfo } from "./user-info";

export default async function ProfilePage() {
  const session = await getSession();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  return <UserInfo session={session} />;
}
