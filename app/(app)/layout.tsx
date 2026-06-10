import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BootstrapProvider } from "@/components/layout/BootstrapProvider";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = await auth();

  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/sin-acceso");

  return (
    <BootstrapProvider>
      <AppShell>{children}</AppShell>
    </BootstrapProvider>
  );
}
