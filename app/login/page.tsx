import { SignIn } from "@/components/auth/sign-in";
import { SignOut } from "@/components/auth/sign-out";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Login() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.6)*2-64px)]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isAuthenticated ? "Cuenta" : "Iniciar sesión"}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {isAuthenticated
              ? `Autenticado como ${
                  session?.user?.name || session?.user?.email || "Usuario"
                }`
              : "Ingresa tus credenciales para acceder a tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-full max-w-xs">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-4 py-2">
                    {session?.user?.email || "No email"}
                  </Badge>
                </div>
                <SignOut />
              </div>
            ) : (
              <SignIn />
            )}
          </div>
        </CardContent>
        {!isAuthenticated && (
          <CardFooter className="flex flex-col space-y-3 border-t px-6 py-3 text-sm text-muted-foreground">
            <div>
              <p className="text-xs text-center">Test credentials:</p>
              <div className="mt-2 text-center text-xs">
                <div>
                  <p className="font-semibold">Admin</p>
                  <p>admin@example.com</p>
                  <p>admin123</p>
                </div>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
