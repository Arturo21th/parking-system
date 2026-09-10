import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
  return (
    <Card>
      <CardContent className="pt-6">
        <ActionForm action={loginAction} className="space-y-4" resetOnSuccess={false}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue="admin@parking.demo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              defaultValue="admin123"
            />
          </div>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </ActionForm>
      </CardContent>
    </Card>
  );
}
