import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/app/(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bentornato</CardTitle>
        <CardDescription>
          Accedi al tuo account per gestire gli shooting.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {registered ? (
          <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
            Account creato. Controlla la tua email per confermare, poi accedi.
          </p>
        ) : null}
        <AuthForm action={login} submitLabel="Accedi" mode="login" />
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center text-sm">
        Non hai un account?{" "}
        <Link
          href="/signup"
          className="text-foreground ml-1 font-medium underline-offset-4 hover:underline"
        >
          Registrati
        </Link>
      </CardFooter>
    </Card>
  );
}
