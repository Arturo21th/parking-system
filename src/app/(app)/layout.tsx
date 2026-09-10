import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { LogoutButton } from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-muted/20 p-4 flex flex-col">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-semibold">🅿️ ParkOps</h1>
          <p className="text-xs text-muted-foreground">
            {session.user.name} · {session.user.role}
          </p>
        </div>
        <Nav />
        <div className="mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
