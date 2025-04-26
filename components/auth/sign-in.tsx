import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignIn() {
  return (
    <form
      className="space-y-4 w-full"
      action={async (formData) => {
        "use server";
        await signIn("credentials", formData);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="passkey">Passkey</Label>
        <Input
          id="passkey"
          name="passkey"
          type="password"
          placeholder="Enter passkey"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full mt-6">
        Sign In
      </Button>
    </form>
  );
}
