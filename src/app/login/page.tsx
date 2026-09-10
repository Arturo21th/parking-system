import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            🅿️ ParkOps
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage the parking facility
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          Demo login: <code>admin@parking.demo</code> /{" "}
          <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
