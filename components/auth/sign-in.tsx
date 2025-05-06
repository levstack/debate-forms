"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

import { authenticate, AuthResult } from "@/app/actions";
import { useEffect } from "react";

// Client component for the sign-in form
function SignInForm() {
  // Use action state hook for handling server actions
  const initialState: AuthResult = { success: false };
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState
  );

  // Watch for successful authentication and redirect
  useEffect(() => {
    if (state.success) {
      // Simply redirect to homepage - NextAuth will handle session refresh
      window.location.href = "/";
    }
  }, [state.success]);

  return (
    <form className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="passkey">Passkey</Label>
        <Input
          id="passkey"
          name="passkey"
          type="password"
          placeholder="Enter passkey"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      {state.message && (
        <div className="text-red-500 text-sm">{state.message}</div>
      )}

      <Button
        formAction={formAction}
        className="w-full mt-6"
        disabled={isPending}
      >
        {isPending ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}

export function SignIn() {
  return <SignInForm />;
}
