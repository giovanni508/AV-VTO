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
import { signup } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Crea il tuo account</CardTitle>
        <CardDescription>
          Inizia a generare shooting Virtual Try-On per il tuo negozio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm action={signup} submitLabel="Registrati" mode="signup" />
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center text-sm">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="text-foreground ml-1 font-medium underline-offset-4 hover:underline"
        >
          Accedi
        </Link>
      </CardFooter>
    </Card>
  );
}
