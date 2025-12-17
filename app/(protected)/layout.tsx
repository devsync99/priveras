import { GlobalNavbar } from "@/components/navbar/global-navbar";
import { getSession } from "@/lib/session";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <>
      {session && <GlobalNavbar session={session} />}
      {children}
    </>
  );
}
