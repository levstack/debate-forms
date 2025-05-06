"use server";

import { signIn } from "@/auth";

export interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthError {
  type?: string;
  [key: string]: string | undefined;
}

/**
 * Server action to handle authentication with credential provider
 * Catches CredentialsSignin errors and returns appropriate responses
 */
export async function authenticate(
  prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // Use redirect: false to handle redirect in client component
    await signIn("credentials", {
      redirect: false,
      passkey: formData.get("passkey")?.toString(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Authentication error:", error);

    // Handle specific error cases
    const authError = error as AuthError;
    if (authError.type === "CredentialsSignin") {
      return {
        success: false,
        message: "Invalid passkey. Please try again.",
      };
    }

    // Handle other error cases
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
