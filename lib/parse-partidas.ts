import {
  TABULADOR_INSTALACIONES,
  PRECIOS_COMIDA,
  PRECIO_VINOS_LICORES,
  PRECIOS_MESAS,
  PRECIOS_ARREGLOS_FLORALES,
  PRECIO_TOLDO_ALEMAN,
  PRECIO_ENTARIMADO,
  COSTOS_DJ,
  PRECIO_PLANTA_LUZ,
  PRECIO_PISTA_ILUMINADA,
  PRECIOS_PISTA_PINTADA,
  PRECIO_CAPILLA,
} from "@/app/configurador/constants"

export interface PartidaItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

export interface CategoriaDetalle {
  categoria: string
  items: PartidaItem[]
}

export function parsePartidas(data: any, quote: any): CategoriaDetalle[] {
  if (!data) return []

  let parsedData = data
  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0]?.categoria) {
    return parsedData
  }

  const categorias: CategoriaDetalle[] = []
  const numInvitados = quote.num_invitados || 100

  // 1. Instalaciones
  const precioInstalaciones = calcularPrecioInstalaciones(numInvitados)
  if (precioInstalaciones > 0) {
    categorias.push({
      categoria: "Renta de Instalaciones",
      items: [
        {
          descripcion: `Renta de instalaciones para ${numInvitados} invitados`,
          cantidad: 1,
          precioUnitario: precioInstalaciones,
          total: precioInstalaciones,
        },
      ],
    })
  }

  // 2. Alimentos
  const itemsComida: PartidaItem[] = []
  const tipoComida = parsedData.tipoComida || quote.menu
  if (tipoComida === "menu3tiempos" || tipoComida === "3tiempos") {
    itemsComida.push({
      descripcion: "Menú 3 Tiempos",
      cantidad: numInvitados,
      precioUnitario: PRECIOS_COMIDA.tresTiempos,
      total: numInvitados * PRECIOS_COMIDA.tresTiempos,
    })
  } else if (tipoComida === "parrillada") {
    itemsComida.push({
      descripcion: "Parrillada de Cortes",
      cantidad: numInvitados,
      precioUnitario: PRECIOS_COMIDA.parrillada,
      total: numInvitados * PRECIOS_COMIDA.parrillada,
    })
  }
  if (itemsComida.length > 0) {
    categorias.push({ categoria: "Alimentos", items: itemsComida })
  }

  // 3. Bebidas
  const itemsBebidas: PartidaItem[] = []
  if (parsedData.incluyeVinosLicores || quote.barra === "premium") {
    itemsBebidas.push({
      descripcion: "Barra de Vinos y Licores Premium",
      cantidad: numInvitados,
      precioUnitario: PRECIO_VINOS_LICORES,
      total: numInvitados * PRECIO_VINOS_LICORES,
    })
  }
  if (itemsBebidas.length > 0) {
    categorias.push({ categoria: "Bebidas", items: itemsBebidas })
  }

  // 4. Mobiliario
  const itemsMobiliario: PartidaItem[] = []
  const mesas = parsedData.mesasSeleccionadas || {}
  const mesasConfig: Record<string, { nombre: string; precio: number }> = {
    default: { nombre: "Mesa Estándar", precio: PRECIOS_MESAS.default },
    shabbyChic: { nombre: "Mesa Shabby Chic", precio: PRECIOS_MESAS.shabbyChic },
    marmol: { nombre: "Mesa Mármol", precio: PRECIOS_MESAS.marmol },
    reyArturo: { nombre: "Mesa Rey Arturo", precio: PRECIOS_MESAS.reyArturo },
    cristal: { nombre: "Mesa Cristal", precio: PRECIOS_MESAS.cristal },
    parota: { nombre: "Mesa Parota", precio: PRECIOS_MESAS.parota },
  }

  Object.entries(mesas).forEach(([tipo, cantidad]) => {
    const cant = Number(cantidad)
    if (cant > 0 && mesasConfig[tipo]) {
      itemsMobiliario.push({
        descripcion: mesasConfig[tipo].nombre,
        cantidad: cant,
        precioUnitario: mesasConfig[tipo].precio,
        total: cant * mesasConfig[tipo].precio,
      })
    }
  })
  if (itemsMobiliario.length > 0) {
    categorias.push({ categoria: "Mobiliario", items: itemsMobiliario })
  }

  // 5. Arreglos Florales
  const itemsFlores: PartidaItem[] = []
  const flores = parsedData.arreglosFlorales || []
  if (Array.isArray(flores)) {
    const floresAgrupadas: Record<string, number> = {}
    flores.forEach((flor: any) => {
      const key = flor.rango || "rango1"
      floresAgrupadas[key] = (floresAgrupadas[key] || 0) + 1
    })

    const rangosConfig: Record<string, { nombre: string; precio: number }> = {
      rango1: { nombre: "Arreglo Floral Rango 1", precio: PRECIOS_ARREGLOS_FLORALES.rango1 },
      rango2: { nombre: "Arreglo Floral Rango 2", precio: PRECIOS_ARREGLOS_FLORALES.rango2 },
      rango3: { nombre: "Arreglo Floral Rango 3", precio: PRECIOS_ARREGLOS_FLORALES.rango3 },
      rango4: { nombre: "Arreglo Floral Rango 4", precio: PRECIOS_ARREGLOS_FLORALES.rango4 },
      rango5: { nombre: "Arreglo Floral Rango 5", precio: PRECIOS_ARREGLOS_FLORALES.rango5 },
    }

    Object.entries(floresAgrupadas).forEach(([rango, cantidad]) => {
      if (rangosConfig[rango]) {
        itemsFlores.push({
          descripcion: rangosConfig[rango].nombre,
          cantidad,
          precioUnitario: rangosConfig[rango].precio,
          total: cantidad * rangosConfig[rango].precio,
        })
      }
    })
  }
  if (itemsFlores.length > 0) {
    categorias.push({ categoria: "Arreglos Florales", items: itemsFlores })
  }

  // 6. Toldo
  const itemsToldo: PartidaItem[] = []
  if (parsedData.tipoToldo === "aleman") {
    itemsToldo.push({
      descripcion: "Toldo Alemán",
      cantidad: 1,
      precioUnitario: PRECIO_TOLDO_ALEMAN,
      total: PRECIO_TOLDO_ALEMAN,
    })
  }
  if (itemsToldo.length > 0) {
    categorias.push({ categoria: "Toldo", items: itemsToldo })
  }

  // 7. Superficie
  const itemsSuperficie: PartidaItem[] = []
  if (parsedData.tipoSuperficie === "entarimado") {
    itemsSuperficie.push({
      descripcion: "Entarimado (15.87 x 21.96 m)",
      cantidad: 1,
      precioUnitario: PRECIO_ENTARIMADO,
      total: PRECIO_ENTARIMADO,
    })
  }
  if (itemsSuperficie.length > 0) {
    categorias.push({ categoria: "Superficie", items: itemsSuperficie })
  }

  // 8. Música
  const itemsMusica: PartidaItem[] = []
  const tipoMusica = parsedData.tipoMusica
  const tipoEvento = parsedData.tipoEvento || "cena"

  if (tipoMusica === "dj") {
    itemsMusica.push({
      descripcion: "DJ Grupo Reset (5 horas)",
      cantidad: 1,
      precioUnitario: COSTOS_DJ.grupoReset,
      total: COSTOS_DJ.grupoReset,
    })
    itemsMusica.push({
      descripcion: "Equipo de Sonido Bose Romeral",
      cantidad: 1,
      precioUnitario: COSTOS_DJ.equipoSonido,
      total: COSTOS_DJ.equipoSonido,
    })
    itemsMusica.push({
      descripcion: "Cabina DJ con Subwoofers y Bocinas",
      cantidad: 1,
      precioUnitario: COSTOS_DJ.cabinaDJ,
      total: COSTOS_DJ.cabinaDJ,
    })
    if (tipoEvento === "cena") {
      itemsMusica.push({
        descripcion: "Iluminación Arquitectónica de Jardines",
        cantidad: 1,
        precioUnitario: COSTOS_DJ.iluminacionArquitectonica,
        total: COSTOS_DJ.iluminacionArquitectonica,
      })
      itemsMusica.push({
        descripcion: "8 Luces Robóticas + 4 Par LED DJ Light",
        cantidad: 1,
        precioUnitario: COSTOS_DJ.lucesRoboticas,
        total: COSTOS_DJ.lucesRoboticas,
      })
    }
  } else if (tipoMusica === "grupo") {
    itemsMusica.push({
      descripcion: "Planta de Luz para Grupo Musical",
      cantidad: 1,
      precioUnitario: PRECIO_PLANTA_LUZ,
      total: PRECIO_PLANTA_LUZ,
    })
  }
  if (itemsMusica.length > 0) {
    categorias.push({ categoria: "Música y Audio", items: itemsMusica })
  }

  // 9. Pista de Baile
  const itemsPista: PartidaItem[] = []
  const tipoPista = parsedData.tipoPista
  if (tipoPista === "iluminada") {
    itemsPista.push({
      descripcion: "Pista Iluminada LED con Focos Edison",
      cantidad: 1,
      precioUnitario: PRECIO_PISTA_ILUMINADA,
      total: PRECIO_PISTA_ILUMINADA,
    })
  } else if (tipoPista === "pintada") {
    let precioPista: number = (PRECIOS_PISTA_PINTADA as any)[50]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[50] ?? 0
    if (numInvitados <= 50) precioPista = (PRECIOS_PISTA_PINTADA as any)[50]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[50] ?? 0
    else if (numInvitados <= 100) precioPista = (PRECIOS_PISTA_PINTADA as any)[100]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[100] ?? 0
    else if (numInvitados <= 150) precioPista = (PRECIOS_PISTA_PINTADA as any)[150]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[150] ?? 0
    else if (numInvitados <= 250) precioPista = (PRECIOS_PISTA_PINTADA as any)[250]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[250] ?? 0
    else precioPista = (PRECIOS_PISTA_PINTADA as any)[400]?.precio ?? (PRECIOS_PISTA_PINTADA as any)[400] ?? 0

    itemsPista.push({
      descripcion: "Pista Pintada a Mano",
      cantidad: 1,
      precioUnitario: precioPista,
      total: precioPista,
    })
  }
  if (itemsPista.length > 0) {
    categorias.push({ categoria: "Pista de Baile", items: itemsPista })
  }

  // 10. Capilla
  const itemsCapilla: PartidaItem[] = []
  if (parsedData.incluyeCapilla) {
    itemsCapilla.push({
      descripcion: "Capilla Cristo del Romeral (Consagrada)",
      cantidad: 1,
      precioUnitario: PRECIO_CAPILLA,
      total: PRECIO_CAPILLA,
    })
  }
  if (itemsCapilla.length > 0) {
    categorias.push({ categoria: "Ceremonia Religiosa", items: itemsCapilla })
  }

  // 11. Extras
  const itemsExtras: PartidaItem[] = []
  const extras = parsedData.extrasSeleccionados || []
  if (Array.isArray(extras)) {
    extras.forEach((extra: any) => {
      if (extra && extra.nombre) {
        const cantidad = extra.porPersona ? numInvitados : 1
        itemsExtras.push({
          descripcion: extra.nombre,
          cantidad,
          precioUnitario: extra.precio || 0,
          total: cantidad * (extra.precio || 0),
        })
      }
    })
  }
  if (itemsExtras.length > 0) {
    categorias.push({ categoria: "Extras", items: itemsExtras })
  }

  return categorias
}

function calcularPrecioInstalaciones(numInvitados: number): number {
  for (const rango of TABULADOR_INSTALACIONES) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.precio
    }
  }
  return TABULADOR_INSTALACIONES[TABULADOR_INSTALACIONES.length - 1].precio
}
