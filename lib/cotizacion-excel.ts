/**
 * Utility for generating Excel from cotizaciones
 * Creates a formatted spreadsheet with categories and line items
 */

import * as XLSX from "xlsx"

interface LineaItem {
    id: string
    nombre: string
    descripcion: string | null
    categoria: string | null
    precio_unitario: number
    cantidad: number
    es_por_invitado: boolean
}

interface CotizacionData {
    titulo: string
    contacts?: {
        nombre_pareja: string
        fecha_evento?: string
    } | null
}

interface CategoriaAgrupada {
    nombre: string
    lineas: LineaItem[]
}

/**
 * Generate Excel from cotización data
 * @param cotizacion - Quote header data
 * @param lineas - Quote line items
 * @param numInvitados - Number of guests (for per-guest calculations)
 */
export async function generarExcelCotizacion(
    cotizacion: CotizacionData,
    lineas: LineaItem[],
    numInvitados: number = 1
) {
    // Group by category
    const categoriasAgrupadas = agruparPorCategoria(lineas)

    // Build data structure for Excel
    const excelData: any[] = []

    // Header info
    excelData.push([])
    excelData.push(["EL ROMERAL"])
    excelData.push([cotizacion.titulo || "COTIZACIÓN"])
    excelData.push([cotizacion.contacts?.nombre_pareja || ""])
    if (cotizacion.contacts?.fecha_evento) {
        const dateStr = new Date(cotizacion.contacts.fecha_evento + "T00:00:00").toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        excelData.push([`Fecha evento: ${dateStr}`])
    }
    excelData.push([`Invitados: ${numInvitados}`])
    excelData.push([])

    // Table headers
    const tableHeaders = ["Categoría", "Descripción", "Detalle", "Cantidad", "Precio Unit.", "Subtotal"]
    excelData.push(tableHeaders)

    let totalEstimado = 0

    // Add items by category
    categoriasAgrupadas.forEach((cat) => {
        let firstInCategory = true

        cat.lineas.forEach((item) => {
            const cant = item.cantidad
            const qty = item.es_por_invitado ? cant * numInvitados : cant
            const subtotal = item.precio_unitario * qty
            totalEstimado += subtotal

            const row = [
                firstInCategory ? cat.nombre : "",
                item.nombre,
                item.descripcion || "",
                item.es_por_invitado ? `${cant}×${numInvitados}=${qty}` : qty,
                item.precio_unitario,
                subtotal,
            ]
            excelData.push(row)
            firstInCategory = false
        })

        // Category subtotal
        const categorySubtotal = cat.lineas.reduce((sum, l) => {
            const qty = l.es_por_invitado ? l.cantidad * numInvitados : l.cantidad
            return sum + l.precio_unitario * qty
        }, 0)

        excelData.push(["", "", `Subtotal ${cat.nombre}`, "", "", categorySubtotal])
        excelData.push([])
    })

    // Total row
    excelData.push(["", "", "TOTAL ESTIMADO", "", "", totalEstimado])
    excelData.push([])
    excelData.push(["Precios en moneda nacional - No incluye I.V.A."])
    excelData.push([`Generado: ${new Date().toLocaleDateString("es-MX")}`])

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Format columns
    ws["!cols"] = [
        { wch: 18 }, // Categoría
        { wch: 35 }, // Descripción
        { wch: 30 }, // Detalle
        { wch: 12 }, // Cantidad
        { wch: 15 }, // Precio Unit.
        { wch: 15 }, // Subtotal
    ]

    // Format cells (numbers as currency)
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
    for (let row = range.s.r; row <= range.e.r; row++) {
        // Column E (precio unitario) and F (subtotal)
        for (let col of [4, 5]) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            if (ws[cellAddress]) {
                if (typeof ws[cellAddress].v === "number") {
                    ws[cellAddress].z = '"$"#,##0.00'
                }
            }
        }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Cotización")

    // Generate filename
    const pareja = cotizacion.contacts?.nombre_pareja?.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "y") || "cotizacion"
    const fileName = `cotizacion-${pareja}-${new Date().toISOString().split("T")[0]}.xlsx`

    // Save file
    XLSX.writeFile(wb, fileName)
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
