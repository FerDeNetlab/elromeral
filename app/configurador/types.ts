// Tipos compartidos del configurador

export interface MesasSeleccionadas {
  default: number
  shabbyChic: number
  marmol: number
  reyArturo: number
  cristal: number
  parota: number
}

export interface ConfiguradorData {
  // Paso 1: Información básica
  nombresNovios: string
  tipoEvento: "comida" | "cena" | ""
  numInvitados: number
  fechaEvento: string
  email: string
  telefono: string

  // Paso 2: Comida
  tipoComida: "menu3tiempos" | "parrillada" | ""

  // Paso 3: Bebidas
  incluyeVinosLicores: boolean | null

  // Paso 4: Mesas
  mesasDefault: number
  mesasShabbyChic: number
  mesasMarmol: number
  mesasReyArturo: number
  mesasCristal: number
  mesasParota: number
  mesasSeleccionadas?: MesasSeleccionadas

  // Paso 5: Mesa de Novios
  incluyeMesaNovios?: boolean | null
  tipoMesaNovios?: string
  tipoAsientoNovios?: string

  // Paso 6: Flores
  arreglosFlorales: ArregloFloral[]

  // Paso 7: Toldo
  tipoToldo: "default" | "aleman" | "personalizado" | ""

  // Paso 8: Superficie
  tipoSuperficie: "pasto" | "entarimado" | ""

  // Paso 9: Música
  tipoMusica: "dj" | "grupo" | ""

  // Paso 10: Pista
  tipoPista: "iluminada" | "pintada" | ""

  // Paso 11: Capilla
  incluyeCapilla: boolean

  // Paso 12: Extras
  extrasSeleccionados: string[]
}

export interface ArregloFloral {
  tipoMesa: string
  arreglo?: string
  rango?: string
}

export interface StepProps {
  data: ConfiguradorData
  onContinue: (updates: Partial<ConfiguradorData>) => void
}

export interface ExtraItem {
  id: string
  nombre: string
  precio: number
  porPersona: boolean
}

export interface ExtraCategoria {
  titulo: string
  icono: string
  items: ExtraItem[]
}
