// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PIAAssistant } from "./pia-assistant";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <PIAAssistant session={session} />;
}
