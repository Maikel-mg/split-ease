import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <Mail className="mx-auto mb-6 h-8 w-8 text-ink-2" aria-hidden="true" />

        <h1 className="text-2xl font-bold tracking-tight">Revisa tu email</h1>
        <p className="mt-2 text-sm text-ink-2">
          Te hemos enviado un enlace de confirmación. Ábrelo para activar tu cuenta y empezar a
          usar la app.
        </p>

        <Button asChild className="mt-6 h-12 w-full text-base font-bold">
          <Link href="/auth/login">Ir a iniciar sesión</Link>
        </Button>
      </div>
    </main>
  )
}
