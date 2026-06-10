import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BootstrapProvider } from "@/components/layout/BootstrapProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId, orgSlug } = await auth();

  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/sign-in"); // Clerk will intercept and show org selector

  return (
    <BootstrapProvider>
      <div className="flex h-full min-h-screen">
        <Sidebar orgName={orgSlug ?? "Estudio"} />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6 bg-(--slate-100)">{children}</main>
        </div>
      </div>
    </BootstrapProvider>
  );
}
