"use client"

import { useState, useEffect, Suspense, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    ArrowLeft,
    Save,
    Loader2,
    Upload,
    X,
    DollarSign,
    Users,
} from "lucide-react"

interface Category {
    id: string
    nombre: string
    activa: boolean
}

function EditarProductoContent({ productId }: { productId: string }) {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState("")
    const [uploadingImage, setUploadingImage] = useState(false)

    const [titulo, setTitulo] = useState("")
    const [descripcion, setDescripcion] = useState("")
    const [tipoPrecio, setTipoPrecio] = useState<"fijo" | "por_invitado">("fijo")
    const [precio, setPrecio] = useState("")
    const [categoryId, setCategoryId] = useState<string>("")
    const [imagenUrl, setImagenUrl] = useState<string>("")
    const [imagenPreview, setImagenPreview] = useState<string>("")

    const supabase = createClient()

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)

        const [productRes, catsRes] = await Promise.all([
            supabase.from("products").select("*").eq("id", productId).single(),
            supabase
                .from("product_categories")
                .select("*")
                .eq("activa", true)
                .order("orden", { ascending: true }),
        ])

        if (productRes.error || !productRes.data) {
            router.push("/admin/productos")
            return
        }

        const p = productRes.data
        setTitulo(p.titulo)
        setDescripcion(p.descripcion || "")
        setTipoPrecio(p.tipo_precio)
        setPrecio(String(p.precio))
        setCategoryId(p.category_id || "")
        setImagenUrl(p.imagen_url || "")

        if (catsRes.data) setCategories(catsRes.data)
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => setImagenPreview(ev.target?.result as string)
        reader.readAsDataURL(file)

        setUploadingImage(true)

        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const { data, error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, { cacheControl: "3600", upsert: false })

        if (uploadError) {
            setError("Error subiendo la imagen. Verifica que el bucket 'product-images' existe.")
            setUploadingImage(false)
            return
        }

        const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(data.path)

        setImagenUrl(urlData.publicUrl)
        setImagenPreview("")
        setUploadingImage(false)
    }

    const removerImagen = () => {
        setImagenUrl("")
        setImagenPreview("")
    }

    const guardarProducto = async () => {
        setError("")

        if (!titulo.trim()) {
            setError("El título es obligatorio")
            return
        }

        if (!precio || Number(precio) < 0) {
            setError("El precio debe ser un valor válido")
            return
        }

        setGuardando(true)

        const { error: dbError } = await supabase
            .from("products")
            .update({
                titulo: titulo.trim(),
                descripcion: descripcion.trim() || null,
                tipo_precio: tipoPrecio,
                precio: Number(precio),
                imagen_url: imagenUrl || null,
                category_id: categoryId || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", productId)

        if (dbError) {
            setError("Error guardando el producto")
            setGuardando(false)
            return
        }

        router.push("/admin/productos")
    }

    if (loading) {
        return (
            <AdminLayout currentPage="productos">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout currentPage="productos">
            <div className="p-4 lg:p-8 max-w-3xl mx-auto">
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
                            Editar Producto
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Modifica la información del producto o servicio
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Imagen */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">
                            Fotografía
                        </h2>
                        {imagenPreview || imagenUrl ? (
                            <div className="relative w-full h-52 rounded-xl overflow-hidden bg-neutral-100">
                                <Image
                                    src={imagenPreview || imagenUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={removerImagen}
                                    className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                {uploadingImage ? (
                                    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                                        <p className="text-sm text-neutral-500">
                                            Haz clic para subir una imagen
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            JPG, PNG o WebP (máx. 5MB)
                                        </p>
                                    </>
                                )}
                            </label>
                        )}
                    </div>

                    {/* Info básica */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">
                            Información del producto
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">Título *</label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Mesa Shabby Chic, DJ Grupo Reset, etc."
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1.5">Descripción detallada</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Describe las características del producto o servicio..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Precio */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">
                            Configuración de precio
                        </h2>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => setTipoPrecio("fijo")}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${tipoPrecio === "fijo"
                                        ? "border-[#1a1a1a] bg-[#1a1a1a]/5"
                                        : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tipoPrecio === "fijo"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-neutral-100 text-neutral-400"
                                        }`}
                                >
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">Precio fijo</p>
                                    <p className="text-[10px] text-neutral-500">Precio único</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setTipoPrecio("por_invitado")}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${tipoPrecio === "por_invitado"
                                        ? "border-[#1a1a1a] bg-[#1a1a1a]/5"
                                        : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tipoPrecio === "por_invitado"
                                            ? "bg-purple-100 text-purple-600"
                                            : "bg-neutral-100 text-neutral-400"
                                        }`}
                                >
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">Por invitado</p>
                                    <p className="text-[10px] text-neutral-500">Varía por persona</p>
                                </div>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-500 mb-1.5">
                                {tipoPrecio === "fijo" ? "Precio (MXN)" : "Precio por persona (MXN)"}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                                <input
                                    type="number"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categoría */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-base font-medium text-neutral-900 mb-4">Categoría</h2>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/admin/productos"
                            className="px-5 py-3 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={guardarProducto}
                            disabled={guardando}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {guardando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {guardando ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <EditarProductoContent productId={resolvedParams.id} />
            </Suspense>
        </AuthGuard>
    )
}
