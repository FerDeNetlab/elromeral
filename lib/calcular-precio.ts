import {
  PRECIOS_INSTALACIONES,
  PRECIOS_COMIDA,
  PRECIO_VINOS_LICORES,
  PRECIOS_MESAS,
  PRECIOS_ARREGLOS_FLORALES,
  PRECIO_PISTA_ILUMINADA,
  PRECIOS_PISTA_PINTADA,
  PRECIO_CAPILLA,
  PRECIO_DJ_GRUPO_RESET,
  PRECIO_EQUIPO_SONIDO,
  PRECIO_ILUMINACION_ARQUITECTONICA,
  PRECIO_LUCES_ROBOTICAS,
  PRECIO_PLANTA_LUZ_GRUPO,
  PRECIO_TOLDO_ALEMAN,
  PRECIO_TOLDO_PERSONALIZADO,
  PRECIO_ENTARIMADO,
  EXTRAS_COORDINACION,
  EXTRAS_ALIMENTOS,
  EXTRAS_BEBIDAS,
  EXTRAS_DECORACION,
  EXTRAS_TIEMPO,
  PRECIO_MESA_NOVIOS,
} from "@/app/configurador/constants"
import type { ConfiguradorData } from "@/app/configurador/types"

export function calcularPrecioTotal(data: ConfiguradorData): number {
  let total = 0
  const invitados = data.numInvitados || 0

  // 1. Renta de instalaciones basada en número de invitados
  const rangoInstalacion = PRECIOS_INSTALACIONES.find((rango) => invitados >= rango.min && invitados <= rango.max)
  if (rangoInstalacion) {
    total += rangoInstalacion.precio
  }

  // 2. Comida (incluye coctelería, no se cobra por separado)
  if (data.tipoComida && invitados > 0) {
    const precioComida = data.tipoComida === "menu3tiempos" ? PRECIOS_COMIDA.tresTiempos : PRECIOS_COMIDA.parrillada
    total += precioComida * invitados
  }

  // 3. Vinos y licores
  if (data.incluyeVinosLicores && invitados > 0) {
    total += PRECIO_VINOS_LICORES * invitados
  }

  // 4. Mesas - usando las propiedades individuales
  total += (data.mesasDefault || 0) * PRECIOS_MESAS.default
  total += (data.mesasShabbyChic || 0) * PRECIOS_MESAS.shabbyChic
  total += (data.mesasMarmol || 0) * PRECIOS_MESAS.marmol
  total += (data.mesasReyArturo || 0) * PRECIOS_MESAS.reyArturo
  total += (data.mesasCristal || 0) * PRECIOS_MESAS.cristal
  total += (data.mesasParota || 0) * PRECIOS_MESAS.parota

  // 5. Mesa de novios
  if (data.incluyeMesaNovios) {
    total += PRECIO_MESA_NOVIOS
  }

  // 6. Arreglos florales - cada entrada en el array representa UNA mesa
  if (data.arreglosFlorales && data.arreglosFlorales.length > 0) {
    data.arreglosFlorales.forEach((arreglo) => {
      if (arreglo.rango && PRECIOS_ARREGLOS_FLORALES[arreglo.rango as keyof typeof PRECIOS_ARREGLOS_FLORALES]) {
        total += PRECIOS_ARREGLOS_FLORALES[arreglo.rango as keyof typeof PRECIOS_ARREGLOS_FLORALES]
      }
    })
  }

  // 7. Toldos
  if (data.tipoToldo === "aleman") {
    total += PRECIO_TOLDO_ALEMAN
  } else if (data.tipoToldo === "personalizado") {
    total += PRECIO_TOLDO_PERSONALIZADO
  }

  // 8. Superficie
  if (data.tipoSuperficie === "entarimado") {
    total += PRECIO_ENTARIMADO
  }

  // 9. Música
  if (data.tipoMusica === "dj") {
    total += PRECIO_DJ_GRUPO_RESET // DJ Romeral $21,000
    total += PRECIO_EQUIPO_SONIDO // Equipo Bose $88,500

    // Si es evento de cena, incluye iluminación adicional
    if (data.tipoEvento === "cena") {
      total += PRECIO_ILUMINACION_ARQUITECTONICA // $32,000
      total += PRECIO_LUCES_ROBOTICAS // $34,500
    }
  } else if (data.tipoMusica === "grupo") {
    total += PRECIO_PLANTA_LUZ_GRUPO // $9,100
  }

  // 10. Pista de baile
  if (data.tipoPista === "iluminada") {
    total += PRECIO_PISTA_ILUMINADA
  } else if (data.tipoPista === "pintada") {
    const rangoPista = PRECIOS_PISTA_PINTADA.find((rango) => invitados >= rango.min && invitados <= rango.max)
    if (rangoPista) {
      total += rangoPista.precio
    }
  }

  // 11. Capilla
  if (data.incluyeCapilla) {
    total += PRECIO_CAPILLA
  }

  // 12. Extras seleccionados
  if (data.extrasSeleccionados && data.extrasSeleccionados.length > 0) {
    const todosExtras = [
      ...EXTRAS_COORDINACION,
      ...EXTRAS_ALIMENTOS,
      ...EXTRAS_BEBIDAS,
      ...EXTRAS_DECORACION,
      ...EXTRAS_TIEMPO,
    ]

    data.extrasSeleccionados.forEach((extraId) => {
      const extra = todosExtras.find((e) => e.id === extraId)
      if (extra) {
        total += extra.porPersona ? extra.precio * invitados : extra.precio
      }
    })
  }

  return total
}

interface PartidaItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

interface Partida {
  categoria: string
  items: PartidaItem[]
}

export function generarPartidasDetalle(data: ConfiguradorData): Partida[] {
  const partidas: Partida[] = []
  const invitados = data.numInvitados || 0

  // 1. Instalaciones
  const rangoInstalacion = PRECIOS_INSTALACIONES.find((rango) => invitados >= rango.min && invitados <= rango.max)
  if (rangoInstalacion) {
    partidas.push({
      categoria: "Instalaciones",
      items: [
        {
          descripcion: `Renta de instalaciones para ${invitados} invitados`,
          cantidad: 1,
          precioUnitario: rangoInstalacion.precio,
          total: rangoInstalacion.precio,
        },
      ],
    })
  }

  // 2. Comida
  if (data.tipoComida && invitados > 0) {
    const precioComida = data.tipoComida === "menu3tiempos" ? PRECIOS_COMIDA.tresTiempos : PRECIOS_COMIDA.parrillada
    partidas.push({
      categoria: "Alimentos",
      items: [
        {
          descripcion: data.tipoComida === "menu3tiempos" ? "Menú 3 Tiempos" : "Parrillada Argentina Premium",
          cantidad: invitados,
          precioUnitario: precioComida,
          total: precioComida * invitados,
        },
      ],
    })
  }

  // 3. Bebidas
  if (data.incluyeVinosLicores && invitados > 0) {
    partidas.push({
      categoria: "Bebidas",
      items: [
        {
          descripcion: "Barra de Vinos y Licores Premium",
          cantidad: invitados,
          precioUnitario: PRECIO_VINOS_LICORES,
          total: PRECIO_VINOS_LICORES * invitados,
        },
      ],
    })
  }

  // 4. Mobiliario - Mesas
  const mesasItems: PartidaItem[] = []
  if ((data.mesasDefault || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Default",
      cantidad: data.mesasDefault || 0,
      precioUnitario: PRECIOS_MESAS.default,
      total: (data.mesasDefault || 0) * PRECIOS_MESAS.default,
    })
  }
  if ((data.mesasShabbyChic || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Shabby Chic",
      cantidad: data.mesasShabbyChic || 0,
      precioUnitario: PRECIOS_MESAS.shabbyChic,
      total: (data.mesasShabbyChic || 0) * PRECIOS_MESAS.shabbyChic,
    })
  }
  if ((data.mesasMarmol || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Mármol",
      cantidad: data.mesasMarmol || 0,
      precioUnitario: PRECIOS_MESAS.marmol,
      total: (data.mesasMarmol || 0) * PRECIOS_MESAS.marmol,
    })
  }
  if ((data.mesasReyArturo || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Rey Arturo",
      cantidad: data.mesasReyArturo || 0,
      precioUnitario: PRECIOS_MESAS.reyArturo,
      total: (data.mesasReyArturo || 0) * PRECIOS_MESAS.reyArturo,
    })
  }
  if ((data.mesasCristal || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Cristal",
      cantidad: data.mesasCristal || 0,
      precioUnitario: PRECIOS_MESAS.cristal,
      total: (data.mesasCristal || 0) * PRECIOS_MESAS.cristal,
    })
  }
  if ((data.mesasParota || 0) > 0) {
    mesasItems.push({
      descripcion: "Mesa Parota",
      cantidad: data.mesasParota || 0,
      precioUnitario: PRECIOS_MESAS.parota,
      total: (data.mesasParota || 0) * PRECIOS_MESAS.parota,
    })
  }
  if (mesasItems.length > 0) {
    partidas.push({ categoria: "Mobiliario", items: mesasItems })
  }

  // 5. Mesa de novios
  if (data.incluyeMesaNovios) {
    partidas.push({
      categoria: "Mesa de Novios",
      items: [
        {
          descripcion: "Mesa de Novios (con tarima y decoración)",
          cantidad: 1,
          precioUnitario: PRECIO_MESA_NOVIOS,
          total: PRECIO_MESA_NOVIOS,
        },
      ],
    })
  }

  // 6. Flores
  if (data.arreglosFlorales && data.arreglosFlorales.length > 0) {
    const floresItems: PartidaItem[] = []
    const contadorRangos: Record<string, number> = {}
    
    data.arreglosFlorales.forEach((arreglo) => {
      if (arreglo.rango) {
        contadorRangos[arreglo.rango] = (contadorRangos[arreglo.rango] || 0) + 1
      }
    })
    
    Object.entries(contadorRangos).forEach(([rango, cantidad]) => {
      const precio = PRECIOS_ARREGLOS_FLORALES[rango as keyof typeof PRECIOS_ARREGLOS_FLORALES] || 0
      if (precio > 0) {
        floresItems.push({
          descripcion: `Arreglo Floral ${rango}`,
          cantidad,
          precioUnitario: precio,
          total: precio * cantidad,
        })
      }
    })
    
    if (floresItems.length > 0) {
      partidas.push({ categoria: "Floristería", items: floresItems })
    }
  }

  // 7. Toldo
  if (data.tipoToldo === "aleman") {
    partidas.push({
      categoria: "Toldo",
      items: [
        {
          descripcion: "Toldo Alemán",
          cantidad: 1,
          precioUnitario: PRECIO_TOLDO_ALEMAN,
          total: PRECIO_TOLDO_ALEMAN,
        },
      ],
    })
  } else if (data.tipoToldo === "personalizado") {
    partidas.push({
      categoria: "Toldo",
      items: [
        {
          descripcion: "Toldo Personalizado",
          cantidad: 1,
          precioUnitario: PRECIO_TOLDO_PERSONALIZADO,
          total: PRECIO_TOLDO_PERSONALIZADO,
        },
      ],
    })
  }

  // 8. Superficie
  if (data.tipoSuperficie === "entarimado") {
    partidas.push({
      categoria: "Superficie",
      items: [
        {
          descripcion: "Entarimado completo",
          cantidad: 1,
          precioUnitario: PRECIO_ENTARIMADO,
          total: PRECIO_ENTARIMADO,
        },
      ],
    })
  }

  // 9. Música
  if (data.tipoMusica === "dj") {
    const musicaItems: PartidaItem[] = [
      {
        descripcion: "DJ Romeral",
        cantidad: 1,
        precioUnitario: PRECIO_DJ_GRUPO_RESET,
        total: PRECIO_DJ_GRUPO_RESET,
      },
      {
        descripcion: "Equipo de Sonido Bose",
        cantidad: 1,
        precioUnitario: PRECIO_EQUIPO_SONIDO,
        total: PRECIO_EQUIPO_SONIDO,
      },
    ]
    if (data.tipoEvento === "cena") {
      musicaItems.push({
        descripcion: "Iluminación Arquitectónica",
        cantidad: 1,
        precioUnitario: PRECIO_ILUMINACION_ARQUITECTONICA,
        total: PRECIO_ILUMINACION_ARQUITECTONICA,
      })
      musicaItems.push({
        descripcion: "Luces Robóticas",
        cantidad: 1,
        precioUnitario: PRECIO_LUCES_ROBOTICAS,
        total: PRECIO_LUCES_ROBOTICAS,
      })
    }
    partidas.push({ categoria: "Música y Entretenimiento", items: musicaItems })
  } else if (data.tipoMusica === "grupo") {
    partidas.push({
      categoria: "Música y Entretenimiento",
      items: [
        {
          descripcion: "Planta de Luz para Grupo Musical",
          cantidad: 1,
          precioUnitario: PRECIO_PLANTA_LUZ_GRUPO,
          total: PRECIO_PLANTA_LUZ_GRUPO,
        },
      ],
    })
  }

  // 10. Pista de baile
  if (data.tipoPista === "iluminada") {
    partidas.push({
      categoria: "Pista de Baile",
      items: [
        {
          descripcion: "Pista Iluminada LED",
          cantidad: 1,
          precioUnitario: PRECIO_PISTA_ILUMINADA,
          total: PRECIO_PISTA_ILUMINADA,
        },
      ],
    })
  } else if (data.tipoPista === "pintada") {
    const rangoPista = PRECIOS_PISTA_PINTADA.find((rango) => invitados >= rango.min && invitados <= rango.max)
    if (rangoPista) {
      partidas.push({
        categoria: "Pista de Baile",
        items: [
          {
            descripcion: `Pista Pintada ${rangoPista.medida}`,
            cantidad: 1,
            precioUnitario: rangoPista.precio,
            total: rangoPista.precio,
          },
        ],
      })
    }
  }

  // 11. Capilla
  if (data.incluyeCapilla) {
    partidas.push({
      categoria: "Capilla",
      items: [
        {
          descripcion: "Ceremonia en Capilla El Cristo del Romeral",
          cantidad: 1,
          precioUnitario: PRECIO_CAPILLA,
          total: PRECIO_CAPILLA,
        },
      ],
    })
  }

  // 12. Extras
  if (data.extrasSeleccionados && data.extrasSeleccionados.length > 0) {
    const todosExtras = [
      ...EXTRAS_COORDINACION,
      ...EXTRAS_ALIMENTOS,
      ...EXTRAS_BEBIDAS,
      ...EXTRAS_DECORACION,
      ...EXTRAS_TIEMPO,
    ]
    const extrasItems: PartidaItem[] = []

    data.extrasSeleccionados.forEach((extraId) => {
      const extra = todosExtras.find((e) => e.id === extraId)
      if (extra) {
        const cantidad = extra.porPersona ? invitados : 1
        const total = extra.porPersona ? extra.precio * invitados : extra.precio
        extrasItems.push({
          descripcion: extra.nombre,
          cantidad,
          precioUnitario: extra.precio,
          total,
        })
      }
    })

    if (extrasItems.length > 0) {
      partidas.push({ categoria: "Servicios Adicionales", items: extrasItems })
    }
  }

  return partidas
}
