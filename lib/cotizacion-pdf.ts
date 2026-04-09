/**
 * Utility for generating PDF from cotizaciones
 * Used by both admin panel and public quote pages
 */

interface LineaItem {
    id: string
    nombre: string
    descripcion: string | null
    categoria: string | null
    precio_unitario: number
    cantidad: number
    es_por_invitado: boolean
    nota: string | null
    es_acordado: boolean
}

interface CotizacionData {
    titulo: string
    contacts?: {
        nombre_pareja: string
        fecha_evento?: string | null
    } | null
}

interface CategoriaAgrupada {
    nombre: string
    lineas: LineaItem[]
}

/**
 * Generate PDF from cotización data
 * @param cotizacion - Quote header data
 * @param lineas - Quote line items
 * @param numInvitados - Number of guests (for per-guest calculations)
 * @param itemsSeleccionados - Optional map of selected items (undefined = all items)
 * @returns jsPDF document
 */
export async function generarPdfCotizacion(
    cotizacion: CotizacionData,
    lineas: LineaItem[],
    numInvitados: number = 1,
    itemsSeleccionados?: Record<string, boolean>
) {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin

    // Filter items based on selection (if provided)
    const lineasAMostrar = itemsSeleccionados
        ? lineas.filter((l) => itemsSeleccionados[l.id])
        : lineas

    // Group by category
    const categoriasAgrupadas = agruparPorCategoria(lineasAMostrar)

    // Header
    doc.setFontSize(24)
    doc.setTextColor(60, 60, 60)
    doc.text("EL ROMERAL", pageWidth / 2, 25, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text((cotizacion.titulo || "COTIZACIÓN").toUpperCase(), pageWidth / 2, 33, { align: "center" })

    doc.setFontSize(14)
    doc.setTextColor(80, 80, 80)
    doc.text(cotizacion.contacts?.nombre_pareja || "", pageWidth / 2, 45, { align: "center" })

    if (cotizacion.contacts?.fecha_evento) {
        doc.setFontSize(10)
        const dateStr = new Date(cotizacion.contacts.fecha_evento + "T00:00:00").toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        doc.text(dateStr, pageWidth / 2, 52, { align: "center" })
    }

    let yPos = 70

    // Process each category
    categoriasAgrupadas.forEach((cat) => {
        if (yPos > pageHeight - 100) {
            doc.addPage()
            yPos = margin + 10
        }

        // Category title
        doc.setFontSize(11)
        doc.setTextColor(74, 80, 67)
        doc.setFont("helvetica", "bold")
        doc.text(cat.nombre.toUpperCase(), margin, yPos)
        yPos += 7

        // Category line
        doc.setDrawColor(74, 80, 67)
        doc.setLineWidth(0.3)
        doc.line(margin, yPos, pageWidth - margin, yPos)
        yPos += 8

        // Table headers
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(40, 40, 40)
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, yPos - 5, contentWidth, 6, "F")

        const colWidths = {
            nombre: contentWidth * 0.3,
            descripcion: contentWidth * 0.2,
            cantidad: contentWidth * 0.15,
            precioUnitario: contentWidth * 0.15,
            subtotal: contentWidth * 0.2,
        }

        let xPos = margin
        doc.text("Descripción", xPos + 2, yPos)
        xPos += colWidths.nombre

        doc.text("Detalle", xPos + 2, yPos)
        xPos += colWidths.descripcion

        doc.text("Cant.", xPos + 2, yPos)
        xPos += colWidths.cantidad

        doc.text("P. Unitario", xPos + 2, yPos)
        xPos += colWidths.precioUnitario

        doc.text("Subtotal", xPos + 2, yPos, { align: "right" })
        yPos += 8

        // Table items
        doc.setFont("helvetica", "normal")
        doc.setTextColor(40, 40, 40)

        cat.lineas.forEach((item, index) => {
            if (yPos > pageHeight - 30) {
                doc.addPage()
                yPos = margin + 10
            }

            const cant = item.cantidad
            const qty = item.es_por_invitado ? cant * numInvitados : cant
            const subtotal = item.precio_unitario * qty

            doc.setFontSize(8)
            const lineHeight = 6

            // Cell background alternation
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250)
                doc.rect(margin, yPos - 4, contentWidth, lineHeight, "F")
            }

            xPos = margin

            // Nombre (truncated if needed)
            const nombre = item.nombre.length > 40 ? item.nombre.substring(0, 37) + "..." : item.nombre
            doc.text(nombre, xPos + 2, yPos)
            xPos += colWidths.nombre

            // Descripción
            const desc = item.descripcion
                ? item.descripcion.length > 30
                    ? item.descripcion.substring(0, 27) + "..."
                    : item.descripcion
                : "-"
            doc.text(desc, xPos + 2, yPos)
            xPos += colWidths.descripcion

            // Cantidad
            const cantText = item.es_por_invitado ? `${cant}×${numInvitados}=${qty}` : `${qty}`
            doc.text(cantText, xPos + 2, yPos)
            xPos += colWidths.cantidad

            // Precio unitario
            doc.text(`$${item.precio_unitario.toLocaleString("es-MX")}`, xPos + 2, yPos)
            xPos += colWidths.precioUnitario

            // Subtotal
            doc.text(`$${subtotal.toLocaleString("es-MX")}`, xPos + colWidths.precioUnitario - 2, yPos, { align: "right" })

            yPos += lineHeight
        })

        yPos += 5
    })

    // Total section
    if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = margin + 10
    }

    const totalEstimado = lineasAMostrar.reduce((sum, l) => {
        const qty = l.es_por_invitado ? l.cantidad * numInvitados : l.cantidad
        return sum + l.precio_unitario * qty
    }, 0)

    doc.setFillColor(74, 80, 67)
    doc.rect(margin, yPos, contentWidth, 12, "F")
    yPos += 9

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("TOTAL ESTIMADO", margin + 2, yPos)
    doc.text(`$${totalEstimado.toLocaleString("es-MX")} MXN`, pageWidth - margin - 2, yPos, { align: "right" })

    yPos += 15

    // Footer
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text("Precios en moneda nacional - No incluye I.V.A.", pageWidth / 2, yPos, { align: "center" })
    doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, pageWidth / 2, yPos + 5, { align: "center" })

    return doc
}

/**
 * Group lineas by category
 */
function agruparPorCategoria(lineas: LineaItem[]): CategoriaAgrupada[] {
    const map = new Map<string, LineaItem[]>()
    lineas.forEach((l) => {
        const cat = l.categoria || "Otros"
        if (!map.has(cat)) map.set(cat, [])
        map.get(cat)!.push(l)
    })
    return Array.from(map.entries()).map(([nombre, lineas]) => ({ nombre, lineas }))
}
