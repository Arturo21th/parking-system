import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

export async function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
