import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipoEvento, fecha, personas, capacidadMaxima, vigencia } = body

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Header con logo (simulado con texto)
    doc.setFontSize(24)
    doc.setTextColor(60, 60, 60)
    doc.text("EL ROMERAL", pageWidth / 2, yPos, { align: "center" })
    yPos += 8
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text("Jardín para Eventos", pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // Título principal
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text("EXPERIENCIA INTEGRAL", pageWidth / 2, yPos, { align: "center" })
    yPos += 10
    doc.setFontSize(16)
    doc.text(tipoEvento, pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // Destinatario
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text("ESTIMADA", pageWidth / 2, yPos, { align: "center" })
    yPos += 6
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.text("Sra. Graciela", pageWidth / 2, yPos, { align: "center" })
    yPos += 12

    // Datos generales
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Fecha: ${fecha || "Sábado 28 de marzo de 2026"}`, 20, yPos)
    yPos += 6
    doc.text(`Número de personas: ${personas || "70"} (capacidad máxima: ${capacidadMaxima || "100"})`, 20, yPos)
    yPos += 6
    doc.text(`Vigencia de cotización: ${vigencia || "1 semana"}`, 20, yPos)
    yPos += 15

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPos, pageWidth - 20, yPos)
    yPos += 10

    // Partidas
    const partidas = [
      {
        categoria: "Locación - El Romeral",
        inversion: "$119,000",
        descripcion:
          "Renta de instalaciones con uso exclusivo del espacio por 6 horas de instalaciones y 5 horas de evento, considerando un aforo máximo de 100 personas.",
        detalles: [
          "• Planta de luz para garantizar el uso de las áreas generales",
          "• Estacionamiento bardeado e iluminado para 350 autos",
          "• Servicio de valet parking",
          "• Uso de bote y remos para sesión fotográfica",
        ],
      },
      {
        categoria: "Ceremonia religiosa y ambientación en capilla",
        inversion: "$22,000",
        descripcion:
          "Ambientación integral de la capilla que incluye alfombra a elegir (roja, azul o ivory), iluminación arquitectónica interior y exterior, telas cubre reclinatorios, banca doble para celebrantes y sillón para sacerdote tejido en tule.",
      },
      {
        categoria: "Banquete - Menú a 2 tiempos",
        inversion: "$74,200",
        descripcion:
          "Menú a 2 tiempos: Entrada (crema o ensalada) + plato fuerte + postre. El cliente elige 2 tiempos del menú propuesto. Incluye mobiliario completo, servicio de meseros, sillas, mantelería y cubiertos. Plato fuerte con proteína a elegir: pollo, cerdo o pescado. 70 personas.",
        montaje: [
          "• Mesa: Redonda/cuadrada",
          "• Silla inyectada",
          "• Mantel tergal catalán en cualquier color",
          "• Cubre mantel organza liso",
          "• Servilleta de tela",
        ],
      },
      {
        categoria: "Barra de bebidas sin alcohol",
        inversion: "$6,300",
        descripcion:
          "Barra de bebidas sin alcohol que incluye mobiliario de barra, hielo, cristalería, refrescos, aguas y jugos, con bartender incluido (1 por cada 100 personas).",
      },
      {
        categoria: "Floristería - Centros de mesa",
        inversion: "$10,150",
        descripcion: "7 centros de mesa florales tipo bouquet de 45 cm de diámetro, elaborados con flor natural de temporada para mesas de invitados.",
      },
      {
        categoria: "Audio y ambientación",
        inversion: "$14,500",
        descripcion:
          "Sistema de sonido ambiental instalado en el salón, con reproducción musical continua mediante playlist proporcionada por el cliente.",
      },
      {
        categoria: "Entretenimiento infantil",
        inversion: "$2,900",
        descripcion: "Brincolín infantil con capacidad de hasta 20 niños, ideal para acompañar el desarrollo del evento y brindar comodidad a las familias.",
      },
    ]

    partidas.forEach((partida: any) => {
      // Verificar si necesitamos nueva página
      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(12)
      doc.setTextColor(40, 40, 40)
      doc.text(partida.categoria, 20, yPos)
      doc.setFontSize(14)
      doc.text(partida.inversion, pageWidth - 20, yPos, { align: "right" })
      yPos += 7

      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      const descripcionSplit = doc.splitTextToSize(partida.descripcion, pageWidth - 40)
      doc.text(descripcionSplit, 20, yPos)
      yPos += descripcionSplit.length * 5 + 3

      // Detalles de instalaciones
      if (partida.detalles) {
        yPos += 3
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        partida.detalles.forEach((detalle: string) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          const detalleSplit = doc.splitTextToSize(detalle, pageWidth - 45)
          doc.text(detalleSplit, 25, yPos)
          yPos += detalleSplit.length * 4
        })
        yPos += 2
      }

      // Montaje de banquete
      if (partida.montaje) {
        yPos += 3
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text("Montaje incluye:", 25, yPos)
        yPos += 4
        partida.montaje.forEach((item: string) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          const itemSplit = doc.splitTextToSize(item, pageWidth - 45)
          doc.text(itemSplit, 25, yPos)
          yPos += itemSplit.length * 4
        })
        yPos += 2
      }

      yPos += 3
      doc.setDrawColor(230, 230, 230)
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 8
    })

    // Total Experiencia Integral
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    yPos += 5
    doc.setFillColor(245, 245, 245)
    doc.rect(20, yPos, pageWidth - 40, 25, "F")
    yPos += 8
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)
    doc.text("INVERSIÓN TOTAL EXPERIENCIA INTEGRAL", 25, yPos)
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text("$249,050 MXN", pageWidth - 25, yPos, { align: "right" })
    yPos += 25

    // Nueva página para servicios adicionales
    doc.addPage()
    yPos = 20

    // Título servicios adicionales
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("SERVICIOS ADICIONALES COTIZADOS", pageWidth / 2, yPos, { align: "center" })
    yPos += 5
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text("Elementos complementarios opcionales", pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // A. Mobiliario y decoración especial
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("A. Mobiliario y decoración especial", 20, yPos)
    yPos += 7

    const adicionales = [
      { nombre: "Mesa Rey Arturo", detalle: "Cantidad: 2 • Capacidad: hasta 16 personas por mesa", precio: "$4,600" },
      {
        nombre: "Árboles gigantes decorativos con arreglo artificial",
        detalle: "Centro de mesa Rey Arturo • Cantidad: 2",
        precio: "$43,700",
      },
    ]

    adicionales.forEach((item) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(item.nombre, 25, yPos)
      doc.text(item.precio, pageWidth - 25, yPos, { align: "right" })
      yPos += 5
      if (item.detalle) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        const detalleSplit = doc.splitTextToSize(item.detalle, pageWidth - 55)
        doc.text(detalleSplit, 25, yPos)
        yPos += detalleSplit.length * 4
      }
      yPos += 5
    })

    yPos += 5

    // B. Toldos, telas y montajes decorativos
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("B. Toldos, telas y montajes decorativos", 20, yPos)
    yPos += 7

    const toldos = [
      { nombre: "Telas en estructura metálica sobre jardín", detalle: "Dos tonos claros", precio: "$26,800" },
      {
        nombre: "Telar decorativo en techo",
        detalle: "Color ivory con juego de cortinas en salón",
        precio: "$29,600",
      },
    ]

    toldos.forEach((item) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(item.nombre, 25, yPos)
      doc.text(item.precio, pageWidth - 25, yPos, { align: "right" })
      yPos += 5
      if (item.detalle) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        const detalleSplit = doc.splitTextToSize(item.detalle, pageWidth - 55)
        doc.text(detalleSplit, 25, yPos)
        yPos += detalleSplit.length * 4
      }
      yPos += 5
    })

    yPos += 5

    // C. Floristería
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("C. Floristería y elementos colgantes", 20, yPos)
    yPos += 7

    const floristeria = [
      {
        nombre: "Arco floral tipo nube o gypsophila",
        detalle: "5 metros de ancho por 4 metros de alto",
        precio: "$32,600",
      },
      {
        nombre: "Colgantes florales tipo nube o gypsophila",
        detalle: "12 metros de largo cada uno, colocados a 4 metros de altura • Cantidad: 2",
        precio: "$34,400",
      },
    ]

    floristeria.forEach((item) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(item.nombre, 25, yPos)
      doc.text(item.precio, pageWidth - 25, yPos, { align: "right" })
      yPos += 5
      if (item.detalle) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        const detalleSplit = doc.splitTextToSize(item.detalle, pageWidth - 55)
        doc.text(detalleSplit, 25, yPos)
        yPos += detalleSplit.length * 4
      }
      yPos += 5
    })

    // D. Ceremonia religiosa
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("D. Ceremonia religiosa - música", 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text("Coro de niños", 25, yPos)
    doc.text("$13,000", pageWidth - 25, yPos, { align: "right" })
    yPos += 5
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    const detalleCoro = doc.splitTextToSize(
      "Angeles de Dios Coro infantil San Luis Gonzaga • Consta de 14 elementos y un teclado",
      pageWidth - 55
    )
    doc.text(detalleCoro, 25, yPos)
    yPos += detalleCoro.length * 4 + 5

    // E. Tiempos extra
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("E. Tiempos extra y servicios operativos", 20, yPos)
    yPos += 7

    const tiemposExtra = [
      { nombre: "Hora extra de insumos y bebidas sin vinos ni licores", precio: "$3,150" },
      { nombre: "Hora extra de locación + servicio", precio: "$8,200" },
      { nombre: "Tiempo extra de alimentos", detalle: "$160 por persona • 70 invitados", precio: "$11,200" },
    ]

    tiemposExtra.forEach((item) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(item.nombre, 25, yPos)
      doc.text(item.precio, pageWidth - 25, yPos, { align: "right" })
      yPos += 5
      if (item.detalle) {
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(item.detalle, 25, yPos)
        yPos += 4
      }
      yPos += 3
    })

    // F. Coctelería
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }

    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text("F. Coctelería en alberca", 20, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text("Coctelería en alberca", 25, yPos)
    doc.text("$12,110", pageWidth - 25, yPos, { align: "right" })
    yPos += 5
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("105 copas • Incluye: Selección de 4 sabores de un menú de 12 cocteles", 25, yPos)
    yPos += 15

    // Total adicionales
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos, pageWidth - 40, 20, "F")
    yPos += 7
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text("TOTAL SERVICIOS ADICIONALES", 25, yPos)
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("$219,360 MXN", pageWidth - 25, yPos, { align: "right" })
    yPos += 18

    // Total general
    doc.setFillColor(40, 40, 40)
    doc.rect(20, yPos, pageWidth - 40, 22, "F")
    yPos += 8
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("INVERSIÓN TOTAL GENERAL", 25, yPos)
    doc.setFontSize(18)
    doc.text("$468,410 MXN", pageWidth - 25, yPos, { align: "right" })
    yPos += 25

    // Nueva página para condiciones comerciales
    doc.addPage()
    yPos = 20

    // Título términos comerciales
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("TÉRMINOS COMERCIALES", pageWidth / 2, yPos, { align: "center" })
    yPos += 5
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text("Experiencia Integral", pageWidth / 2, yPos, { align: "center" })
    yPos += 15

    // Fechas importantes
    doc.setFillColor(40, 40, 40)
    doc.rect(20, yPos, pageWidth - 40, 32, "F")
    yPos += 6
    doc.setFontSize(8)
    doc.setTextColor(200, 200, 200)
    doc.text("FECHAS IMPORTANTES", 25, yPos)
    yPos += 6
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text("07 de febrero: Firma de contrato y entrega del anticipo del 35% del presupuesto elegido", 25, yPos)
    yPos += 5
    doc.text("28 de febrero: Liquidación del total restante del presupuesto elegido", 25, yPos)
    yPos += 18

    // Nota importante sobre servicios
    doc.setFillColor(250, 250, 250)
    doc.rect(20, yPos, pageWidth - 40, 45, "F")
    doc.setDrawColor(200, 200, 200)
    doc.rect(20, yPos, pageWidth - 40, 45, "S")
    yPos += 6
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    const notaImportante = doc.splitTextToSize(
      "** Todos los servicios deberán contratarse con El Romeral para poder aplicar el precio preferencial en la renta de instalaciones y cortesías de la 'Experiencia Integral'.",
      pageWidth - 50
    )
    doc.text(notaImportante, 25, yPos)
    yPos += notaImportante.length * 4 + 4
    
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text("Con excepción de:", 25, yPos)
    yPos += 4
    const excepciones = [
      "• Vinos y licores en botella cerrada (No servicios a proveedores externos de barras)",
      "• Fotógrafo y video",
      "• Mariachi",
      "• Souvenirs (Cilindros, pantunflas, etc)",
      "• Grupo Musical (Se rentará con El Romeral la planta de luz para grupo musical y/o tarimas)",
    ]
    excepciones.forEach((excepcion) => {
      const excepcionSplit = doc.splitTextToSize(excepcion, pageWidth - 55)
      doc.text(excepcionSplit, 28, yPos)
      yPos += excepcionSplit.length * 3.5
    })
    yPos += 10

    // Términos comerciales
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    const terminos = [
      "• Precios en moneda nacional",
      "• No incluye I.V.A.",
      "• Bloqueo de fecha con $25,000 pesos",
      "• Pago del 35% del total del evento al mes para congelar los precios",
      "• Beneficio de pagos en mensualidades sin intereses, pago de última mensualidad un mes antes",
      "• Pagos extemporáneos se les aplicará el 10% por pago extemporáneo",
      "• CAMBIOS DE FECHA: Aplica únicamente cuando por disposición gubernamental no se puedan",
      "  realizar eventos. El evento se programará a la próxima fecha disponible dentro de los 365 días.",
      "• Cancelaciones mayores a 181 días previos: se retendrá el 60% del precio pactado",
      "• Cancelaciones entre 1 día y 180 días previos: deberá liquidar en su totalidad el precio pactado",
      "• Depósito en garantía en efectivo un mes antes del evento, se regresará 8 días posteriores",
    ]
    
    terminos.forEach((item) => {
      // Verificar si necesitamos nueva página
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      const split = doc.splitTextToSize(item, pageWidth - 45)
      doc.text(split, 25, yPos)
      yPos += split.length * 5
    })
    yPos += 15

    // Cortesías
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("CORTESÍAS INCLUIDAS", pageWidth / 2, yPos, { align: "center" })
    yPos += 10

    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    const cortesias = [
      "• Plano de mesas numerado",
      "• Menús de mesa impresos",
      "• Numeración de mesas en totem madera o color plata",
      "• Coordinador de evento",
    ]
    cortesias.forEach((item) => {
      const split = doc.splitTextToSize(item, pageWidth - 40)
      doc.text(split, 20, yPos)
      yPos += split.length * 5 + 3
    })
    
    yPos += 10
    
    // Link a cotización completa
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Ver cotización completa en línea:", 20, yPos)
    yPos += 5
    doc.setTextColor(60, 120, 180)
    doc.textWithLink("elromeral.com.mx/comunion", 20, yPos, {
      url: "https://elromeral.com.mx/comunion",
    })

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text("El Romeral - Jardín para Eventos", pageWidth / 2, yPos, { align: "center" })
    yPos += 4
    doc.text("Zapopan, Jalisco · contacto@elromeral.com.mx", pageWidth / 2, yPos, { align: "center" })

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Cotizacion-${tipoEvento.replace(/\s+/g, "-")}-El-Romeral.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generando PDF:", error)
    return NextResponse.json({ error: "Error al generar PDF" }, { status: 500 })
  }
}
