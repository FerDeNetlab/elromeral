import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="p-12 text-center max-w-md">
        <h1 className="text-6xl font-serif font-light mb-4">404</h1>
        <h2 className="text-2xl font-serif font-light mb-4">Cotización no encontrada</h2>
        <p className="text-muted-foreground mb-8">La cotización que buscas no existe o el enlace es incorrecto.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>Volver al Inicio</Button>
          </Link>
          <Link href="/configurador">
            <Button variant="outline">Personaliza y cotiza tu boda</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
