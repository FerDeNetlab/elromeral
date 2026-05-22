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
    const { default: autoTable } = await import("jspdf-autotable")
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

    // Process each category using autoTable for proper word-wrapping
    for (const cat of categoriasAgrupadas) {
        if (yPos > pageHeight - 60) {
            doc.addPage()
            yPos = margin + 10
        }

        // Category title
        doc.setFontSize(11)
        doc.setTextColor(74, 80, 67)
        doc.setFont("helvetica", "bold")
        doc.text(cat.nombre.toUpperCase(), margin, yPos)
        yPos += 5

        // Category line
        doc.setDrawColor(74, 80, 67)
        doc.setLineWidth(0.3)
        doc.line(margin, yPos, pageWidth - margin, yPos)
        yPos += 3

        // Build table rows — descripcion y nota van debajo del nombre en la misma celda
        const tableBody = cat.lineas.map((item) => {
            const qty = item.es_por_invitado ? item.cantidad * numInvitados : item.cantidad
            const subtotal = item.precio_unitario * qty
            // Combinar nombre + descripcion + nota para que autoTable calcule la altura correcta
            let descripcion = item.nombre
            if (item.descripcion) descripcion += `\n${item.descripcion}`
            if (item.nota) descripcion += `\n${item.nota}`
            return [
                descripcion,
                item.es_por_invitado ? `${item.cantidad}×${numInvitados}=${qty}` : `${qty}`,
                `$${item.precio_unitario.toLocaleString("es-MX")}`,
                `$${subtotal.toLocaleString("es-MX")}`,
            ]
        })

        autoTable(doc, {
            startY: yPos,
            head: [["Descripción", "Cant.", "P. Unitario", "Subtotal"]],
            body: tableBody,
            tableWidth: contentWidth,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 8,
                cellPadding: { top: 3, right: 4, bottom: 3, left: 3 },
                overflow: "linebreak",
                textColor: [40, 40, 40],
                lineWidth: 0,
            },
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [40, 40, 40],
                fontStyle: "bold",
                fontSize: 9,
                lineWidth: 0,
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250],
            },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.52 },
                1: { cellWidth: contentWidth * 0.12, halign: "center" },
                2: { cellWidth: contentWidth * 0.18, halign: "right" },
                3: { cellWidth: contentWidth * 0.18, halign: "right" },
            },
            // Renderizar nombre / descripcion / nota con estilos distintos
            didDrawCell: (data) => {
                if (data.section !== "body" || data.column.index !== 0) return
                const item = cat.lineas[data.row.index]
                if (!item?.descripcion && !item?.nota) return

                const px = data.cell.x + data.cell.padding("left")
                const cellW = data.cell.width - data.cell.padding("left") - data.cell.padding("right")
                const py = data.cell.y + data.cell.padding("top")

                // Fondo (sobreescribir lo que autoTable dibujó)
                const bg = data.row.index % 2 === 0 ? [255, 255, 255] : [250, 250, 250]
                doc.setFillColor(bg[0], bg[1], bg[2])
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F")

                // Nombre — negro, normal, 8pt
                doc.setFontSize(8)
                doc.setTextColor(40, 40, 40)
                doc.setFont("helvetica", "normal")
                const nombreLines = doc.splitTextToSize(item.nombre, cellW)
                doc.text(nombreLines, px, py + 2.5)
                let currentY = py + nombreLines.length * 8 * 0.3528 + 1.5

                // Descripcion — gris oscuro, normal, 7.5pt
                if (item.descripcion) {
                    doc.setFontSize(7.5)
                    doc.setTextColor(90, 90, 90)
                    doc.setFont("helvetica", "normal")
                    const descLines = doc.splitTextToSize(item.descripcion, cellW)
                    doc.text(descLines, px, currentY + 2)
                    currentY += descLines.length * 7.5 * 0.3528 + 2
                }

                // Nota — gris claro, itálica, 7pt
                if (item.nota) {
                    doc.setFontSize(7)
                    doc.setTextColor(140, 140, 140)
                    doc.setFont("helvetica", "italic")
                    const notaLines = doc.splitTextToSize(item.nota, cellW)
                    doc.text(notaLines, px, currentY + 2)
                }

                // Restaurar estilos
                doc.setFontSize(8)
                doc.setTextColor(40, 40, 40)
                doc.setFont("helvetica", "normal")
            },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 10
    }

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
