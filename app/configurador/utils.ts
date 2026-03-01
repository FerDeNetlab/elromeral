import { PRECIOS_INSTALACIONES, PRECIOS_PISTA_PINTADA } from "./constants"

export function calcularPrecioInstalaciones(numInvitados: number): number {
  for (const rango of PRECIOS_INSTALACIONES) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.precio
    }
  }
  return 0
}

export function calcularPrecioPistaPintada(numInvitados: number): { precio: number; medida: string } {
  for (const rango of PRECIOS_PISTA_PINTADA) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return { precio: rango.precio, medida: rango.medida }
    }
  }
  return { precio: 0, medida: "" }
}

export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(precio)
}

export function generarSlug(nombres: string, fecha: string): string {
  const nombresSinEspacios = nombres.toLowerCase().replace(/\s+/g, "")
  const fechaFormateada = fecha.split("-").reverse().join(".")
  return `${nombresSinEspacios}${fechaFormateada}`
}
