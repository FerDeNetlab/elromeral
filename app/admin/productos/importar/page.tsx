"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import * as XLSX from "xlsx"
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Package,
    Tag,
} from "lucide-react"

interface ProductRow {
    titulo: string
    descripcion: string
    tipo_precio: "fijo" | "por_invitado"
    precio: number
    categoria: string
    activo: boolean
    valid: boolean
    errors: string[]
    action: "crear" | "actualizar"
    existingId?: string
}

function ImportarContent() {
    const [file, setFile] = useState<File | null>(null)
    const [rows, setRows] = useState<ProductRow[]>([])
    const [parsing, setParsing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [imported, setImported] = useState(false)
    const [importResult, setImportResult] = useState({ created: 0, updated: 0, errors: 0 })
    const [error, setError] = useState("")

    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        setFile(f)
        setRows([])
        setImported(false)
        setError("")
        parseExcel(f)
    }

    const parseExcel = async (file: File) => {
        setParsing(true)

        try {
            const buffer = await file.arrayBuffer()
            const workbook = XLSX.read(buffer, { type: "array" })

            // Buscar hoja "Productos"
            let sheetName = workbook.SheetNames.find(
                (n) => n.toLowerCase() === "productos"
            )
            if (!sheetName) sheetName = workbook.SheetNames[0]

            const sheet = workbook.Sheets[sheetName]
            const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
                defval: "",
            })

            if (data.length === 0) {
                setError("El archivo no contiene datos")
                setParsing(false)
                return
            }

            // Buscar columnas (case-insensitive)
            // strict=true: busca coincidencia exacta primero, luego parcial
            const getVal = (row: Record<string, unknown>, keys: string[], strict = false) => {
                if (strict) {
                    // Primero intentar coincidencia exacta
                    for (const key of Object.keys(row)) {
                        if (keys.some((k) => key.toLowerCase().trim() === k.toLowerCase())) {
                            return String(row[key] ?? "").trim()
                        }
                    }
                }
                // Fallback: coincidencia parcial
                for (const key of Object.keys(row)) {
                    if (keys.some((k) => key.toLowerCase().trim() === k.toLowerCase())) {
                        return String(row[key] ?? "").trim()
                    }
                }
                // Si no hay match exacto, buscar por inclusión
                for (const key of Object.keys(row)) {
                    if (keys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
                        return String(row[key] ?? "").trim()
                    }
                }
                return ""
            }

            // Cargar productos existentes para detectar duplicados
            const { data: existingProducts } = await supabase
                .from("products")
                .select("id, titulo")

            const existingMap = new Map<string, string>()
            if (existingProducts) {
                existingProducts.forEach((p) => existingMap.set(p.titulo.toLowerCase().trim(), p.id))
            }

            const parsed: ProductRow[] = data.map((row) => {
                const errors: string[] = []

                const titulo = getVal(row, ["título", "titulo", "nombre", "title"])
                const descripcion = getVal(row, ["descripción", "descripcion", "description"])
                const tipoPrecioRaw = getVal(row, ["tipo de precio", "tipo_precio", "tipo", "price type"])
                const precioRaw = getVal(row, ["precio", "price", "costo"], true)
                const categoria = getVal(row, ["categoría", "categoria", "category"])
                const activoRaw = getVal(row, ["activo", "active", "estado"])

                if (!titulo) errors.push("Falta título")

                let tipoPrecio: "fijo" | "por_invitado" = "fijo"
                if (
                    tipoPrecioRaw.toLowerCase().includes("invitado") ||
                    tipoPrecioRaw.toLowerCase() === "por_invitado"
                ) {
                    tipoPrecio = "por_invitado"
                } else if (tipoPrecioRaw && tipoPrecioRaw !== "fijo") {
                    errors.push(`Tipo de precio "${tipoPrecioRaw}" no válido`)
                }

                const precioClean = precioRaw.replace(/[^0-9.]/g, "")
                const precio = precioClean ? Number(precioClean) : NaN
                if (!precioRaw || isNaN(precio) || precio < 0) {
                    errors.push("Precio inválido")
                }

                const activo =
                    activoRaw.toLowerCase() === "no" ||
                        activoRaw.toLowerCase() === "false" ||
                        activoRaw === "0"
                        ? false
                        : true

                // Detectar si ya existe un producto con el mismo título
                const existingId = titulo ? existingMap.get(titulo.toLowerCase().trim()) : undefined

                return {
                    titulo,
                    descripcion,
                    tipo_precio: tipoPrecio,
                    precio: isNaN(precio) ? 0 : precio,
                    categoria,
                    activo,
                    valid: errors.length === 0,
                    errors,
                    action: existingId ? "actualizar" as const : "crear" as const,
                    existingId,
                }
            })

            setRows(parsed)
        } catch {
            setError("Error al leer el archivo. Verifica que sea un archivo Excel válido.")
        }

        setParsing(false)
    }

    const importarProductos = async () => {
        setImporting(true)
        setError("")

        const validRows = rows.filter((r) => r.valid)
        let created = 0
        let updated = 0
        let errors = 0

        // Cargar categorías existentes
        const { data: existingCats } = await supabase
            .from("product_categories")
            .select("*")
            .order("orden", { ascending: true })

        const categoryMap = new Map<string, string>()
        if (existingCats) {
            existingCats.forEach((c) => categoryMap.set(c.nombre.toLowerCase(), c.id))
        }

        let nextOrden = existingCats ? Math.max(...existingCats.map((c) => c.orden), -1) + 1 : 0

        for (const row of validRows) {
            try {
                let categoryId: string | null = null

                // Auto-crear categoría si no existe
                if (row.categoria) {
                    const catKey = row.categoria.toLowerCase()
                    if (categoryMap.has(catKey)) {
                        categoryId = categoryMap.get(catKey)!
                    } else {
                        // Crear nueva categoría
                        const { data: newCat, error: catError } = await supabase
                            .from("product_categories")
                            .insert({
                                nombre: row.categoria,
                                orden: nextOrden,
                                activa: true,
                            })
                            .select("id")
                            .single()

                        if (!catError && newCat) {
                            categoryId = newCat.id
                            categoryMap.set(catKey, newCat.id)
                            nextOrden++
                        }
                    }
                }

                const productData = {
                    titulo: row.titulo,
                    descripcion: row.descripcion || null,
                    tipo_precio: row.tipo_precio,
                    precio: row.precio,
                    category_id: categoryId,
                    activo: row.activo,
                }

                if (row.action === "actualizar" && row.existingId) {
                    // Actualizar producto existente
                    const { error: updateError } = await supabase
                        .from("products")
                        .update(productData)
                        .eq("id", row.existingId)

                    if (updateError) {
                        errors++
                    } else {
                        updated++
                    }
                } else {
                    // Crear producto nuevo
                    const { error: insertError } = await supabase
                        .from("products")
                        .insert(productData)

                    if (insertError) {
                        errors++
                    } else {
                        created++
                    }
                }
            } catch {
                errors++
            }
        }

        setImportResult({ created, updated, errors })
        setImported(true)
        setImporting(false)
    }

    const resetForm = () => {
        setFile(null)
        setRows([])
        setImported(false)
        setError("")
        setImportResult({ created: 0, updated: 0, errors: 0 })
    }

    const validCount = rows.filter((r) => r.valid).length
    const invalidCount = rows.filter((r) => !r.valid).length
    const newCount = rows.filter((r) => r.valid && r.action === "crear").length
    const updateCount = rows.filter((r) => r.valid && r.action === "actualizar").length

    return (
        <AdminLayout currentPage="productos">
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/productos"
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">
                            Importar Productos
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Sube un archivo Excel para agregar productos masivamente
                        </p>
                    </div>
                </div>

                {imported ? (
                    /* Resultado de importación */
                    <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                            ¡Importación completada!
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            {importResult.created > 0 && (
                                <><span className="font-semibold text-green-600">{importResult.created}</span> productos creados</>
                            )}
                            {importResult.created > 0 && importResult.updated > 0 && ", "}
                            {importResult.updated > 0 && (
                                <><span className="font-semibold text-blue-600">{importResult.updated}</span> productos actualizados</>
                            )}
                            {importResult.errors > 0 && (
                                <>
                                    {(importResult.created > 0 || importResult.updated > 0) && " y "}
                                    <span className="font-semibold text-red-500">{importResult.errors}</span> tuvieron errores
                                </>
                            )}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Link
                                href="/admin/productos"
                                className="px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                            >
                                Ver Productos
                            </Link>
                            <button
                                onClick={resetForm}
                                className="px-5 py-3 border border-neutral-200 text-neutral-700 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
                            >
                                Importar más
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Descargar template */}
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-medium text-neutral-900 mb-1">
                                        Template Excel
                                    </h2>
                                    <p className="text-sm text-neutral-500 mb-3">
                                        Descarga el template con el formato correcto, llénalo con tus productos y súbelo aquí. Las categorías que no existan se crearán automáticamente.
                                    </p>
                                    <a
                                        href="/templates/template-productos.xlsx"
                                        download
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar Template
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Upload */}
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <h2 className="text-base font-medium text-neutral-900 mb-4">
                                Subir archivo
                            </h2>

                            {!file ? (
                                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                                    <p className="text-sm text-neutral-500">
                                        Haz clic para seleccionar tu archivo Excel
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        .xlsx o .xls
                                    </p>
                                </label>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {parsing && (
                                <div className="flex items-center justify-center gap-2 mt-4 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                                    <span className="text-sm text-neutral-500">Leyendo archivo...</span>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Preview */}
                        {rows.length > 0 && (
                            <>
                                {/* Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                        <p className="text-xs text-neutral-500 mb-1">Nuevos</p>
                                        <p className="text-2xl font-semibold text-green-600">{newCount}</p>
                                    </div>
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                        <p className="text-xs text-neutral-500 mb-1">Actualizar</p>
                                        <p className="text-2xl font-semibold text-blue-600">{updateCount}</p>
                                    </div>
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                        <p className="text-xs text-neutral-500 mb-1">Válidos</p>
                                        <p className="text-2xl font-semibold">{validCount}</p>
                                    </div>
                                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                        <p className="text-xs text-neutral-500 mb-1">Con errores</p>
                                        <p className="text-2xl font-semibold text-red-500">{invalidCount}</p>
                                    </div>
                                </div>

                                {/* Categorías a crear */}
                                {(() => {
                                    const cats = [
                                        ...new Set(
                                            rows
                                                .filter((r) => r.valid && r.categoria)
                                                .map((r) => r.categoria)
                                        ),
                                    ]
                                    if (cats.length === 0) return null
                                    return (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm text-blue-700 font-medium mb-2 flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                Categorías detectadas ({cats.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {cats.map((cat) => (
                                                    <span
                                                        key={cat}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-blue-500 mt-2">
                                                Las categorías que no existan se crearán automáticamente
                                            </p>
                                        </div>
                                    )
                                })()}

                                {/* Tabla preview */}
                                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                                        <h2 className="font-medium text-neutral-900">
                                            Vista previa de productos
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                        Título
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                        Tipo
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                        Precio
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                        Categoría
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {rows.map((row, index) => (
                                                    <tr
                                                        key={index}
                                                        className={!row.valid ? "bg-red-50/50" : ""}
                                                    >
                                                        <td className="px-4 py-3">
                                                            {row.valid ? (
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${row.action === "actualizar"
                                                                        ? "bg-blue-100 text-blue-700"
                                                                        : "bg-green-100 text-green-700"
                                                                    }`}>
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    {row.action === "actualizar" ? "Actualizar" : "Nuevo"}
                                                                </span>
                                                            ) : (
                                                                <div className="group relative">
                                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                                    <div className="invisible group-hover:visible absolute left-0 top-6 z-10 bg-red-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                                                        {row.errors.join(", ")}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                                                            {row.titulo || (
                                                                <span className="text-red-400 italic">
                                                                    Sin título
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${row.tipo_precio === "fijo"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-purple-100 text-purple-700"
                                                                    }`}
                                                            >
                                                                {row.tipo_precio === "fijo"
                                                                    ? "Fijo"
                                                                    : "Por invitado"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            ${row.precio.toLocaleString("es-MX")}
                                                            {row.tipo_precio === "por_invitado" && (
                                                                <span className="text-[10px] text-neutral-400">
                                                                    /p
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {row.categoria ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-600">
                                                                    <Tag className="w-3 h-3" />
                                                                    {row.categoria}
                                                                </span>
                                                            ) : (
                                                                <span className="text-neutral-400 text-xs">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Botón importar */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={resetForm}
                                        className="px-5 py-3 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={importarProductos}
                                        disabled={importing || validCount === 0}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                        {importing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Importando...
                                            </>
                                        ) : (
                                            <>
                                                <Package className="w-4 h-4" />
                                                Importar {validCount} productos
                                                {updateCount > 0 && ` (${updateCount} actualizaciones)`}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default function ImportarProductosPage() {
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <ImportarContent />
            </Suspense>
        </AuthGuard>
    )
}
