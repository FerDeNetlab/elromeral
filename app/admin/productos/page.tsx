"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthGuard } from "@/components/admin/auth-guard"
import Link from "next/link"
import Image from "next/image"
import {
    Package,
    Plus,
    Loader2,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    Tag,
    DollarSign,
    Users,
    ImageIcon,
} from "lucide-react"

interface Category {
    id: string
    nombre: string
    descripcion: string | null
    orden: number
    activa: boolean
}

interface Product {
    id: string
    titulo: string
    descripcion: string | null
    tipo_precio: "fijo" | "por_invitado"
    precio: number
    imagen_url: string | null
    category_id: string | null
    activo: boolean
    created_at: string
    product_categories?: Category
}

function ProductosContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCategory, setFilterCategory] = useState<string>("todas")

    const supabase = createClient()

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)

        const [productsRes, categoriesRes] = await Promise.all([
            supabase
                .from("products")
                .select("*, product_categories(*)")
                .order("created_at", { ascending: false }),
            supabase
                .from("product_categories")
                .select("*")
                .order("orden", { ascending: true }),
        ])

        if (productsRes.data) setProducts(productsRes.data)
        if (categoriesRes.data) setCategories(categoriesRes.data)
        setLoading(false)
    }

    const toggleActivo = async (id: string, activo: boolean) => {
        await supabase
            .from("products")
            .update({ activo: !activo, updated_at: new Date().toISOString() })
            .eq("id", id)
        cargarDatos()
    }

    const eliminarProducto = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return
        await supabase.from("products").delete().eq("id", id)
        cargarDatos()
    }

    const filteredProducts = products.filter((p) => {
        const matchSearch =
            !searchTerm ||
            p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchCategory =
            filterCategory === "todas" ||
            (filterCategory === "sin_categoria" && !p.category_id) ||
            p.category_id === filterCategory
        return matchSearch && matchCategory
    })

    return (
        <AdminLayout currentPage="productos">
            <div className="p-4 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900 mb-1">
                            Productos y Servicios
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Administra tu catálogo de productos y servicios para bodas
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/productos/categorias"
                            className="flex items-center gap-2 px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            <Tag className="w-4 h-4" />
                            Categorías
                        </Link>
                        <Link
                            href="/admin/productos/nuevo"
                            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Producto
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all"
                    >
                        <option value="todas">Todas las categorías</option>
                        <option value="sin_categoria">Sin categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                        <h2 className="text-lg font-medium text-neutral-700 mb-2">
                            {searchTerm || filterCategory !== "todas"
                                ? "Sin resultados"
                                : "Sin productos aún"}
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            {searchTerm || filterCategory !== "todas"
                                ? "Intenta con otros filtros de búsqueda"
                                : "Agrega tu primer producto o servicio"}
                        </p>
                        {!searchTerm && filterCategory === "todas" && (
                            <Link
                                href="/admin/productos/nuevo"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Agregar Producto
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Métricas rápidas */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Total productos</p>
                                <p className="text-2xl font-semibold">{products.length}</p>
                            </div>
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Activos</p>
                                <p className="text-2xl font-semibold text-green-600">
                                    {products.filter((p) => p.activo).length}
                                </p>
                            </div>
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Precio fijo</p>
                                <p className="text-2xl font-semibold">
                                    {products.filter((p) => p.tipo_precio === "fijo").length}
                                </p>
                            </div>
                            <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                                <p className="text-xs text-neutral-500 mb-1">Por invitado</p>
                                <p className="text-2xl font-semibold">
                                    {products.filter((p) => p.tipo_precio === "por_invitado").length}
                                </p>
                            </div>
                        </div>

                        {/* Grid de productos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={`bg-white border rounded-2xl overflow-hidden hover:shadow-sm transition-all ${product.activo ? "border-neutral-200" : "border-neutral-200 opacity-60"
                                        }`}
                                >
                                    {/* Imagen */}
                                    <div className="relative h-40 bg-neutral-100">
                                        {product.imagen_url ? (
                                            <Image
                                                src={product.imagen_url}
                                                alt={product.titulo}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="w-10 h-10 text-neutral-300" />
                                            </div>
                                        )}
                                        {/* Badge tipo precio */}
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium backdrop-blur-sm ${product.tipo_precio === "fijo"
                                                        ? "bg-blue-500/90 text-white"
                                                        : "bg-purple-500/90 text-white"
                                                    }`}
                                            >
                                                {product.tipo_precio === "fijo" ? (
                                                    <><DollarSign className="w-3 h-3" /> Precio fijo</>
                                                ) : (
                                                    <><Users className="w-3 h-3" /> Por invitado</>
                                                )}
                                            </span>
                                        </div>
                                        {/* Badge estado */}
                                        {!product.activo && (
                                            <div className="absolute top-3 right-3">
                                                <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500/90 text-white backdrop-blur-sm">
                                                    Inactivo
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-semibold text-sm text-neutral-900 line-clamp-1">
                                                {product.titulo}
                                            </h3>
                                            <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                                                ${Number(product.precio).toLocaleString("es-MX")}
                                                {product.tipo_precio === "por_invitado" && (
                                                    <span className="text-[10px] font-normal text-neutral-400">/p</span>
                                                )}
                                            </p>
                                        </div>

                                        {product.descripcion && (
                                            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                                                {product.descripcion}
                                            </p>
                                        )}

                                        {/* Categoría */}
                                        {product.product_categories && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 rounded-md text-[10px] text-neutral-600 mb-3">
                                                <Tag className="w-3 h-3" />
                                                {(product.product_categories as Category).nombre}
                                            </span>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                                            <Link
                                                href={`/admin/productos/${product.id}/editar`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => toggleActivo(product.id, product.activo)}
                                                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                                                title={product.activo ? "Desactivar" : "Activar"}
                                            >
                                                {product.activo ? (
                                                    <ToggleRight className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-neutral-400" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => eliminarProducto(product.id)}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-auto"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    )
}

export default function ProductosPage() {
    return (
        <AuthGuard>
            <Suspense fallback={null}>
                <ProductosContent />
            </Suspense>
        </AuthGuard>
    )
}
