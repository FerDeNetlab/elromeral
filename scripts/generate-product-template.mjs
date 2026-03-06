// Script para generar el template Excel de productos
// Ejecutar con: node scripts/generate-product-template.mjs

import XLSX from "xlsx"

const headers = [
    "Título",
    "Descripción",
    "Tipo de Precio",
    "Precio",
    "Categoría",
    "Activo",
]

const exampleData = [
    [
        "Mesa Shabby Chic",
        "Mesa rectangular estilo rústico con acabado envejecido, incluye mantel de lino",
        "fijo",
        15000,
        "Mobiliario",
        "sí",
    ],
    [
        "Banquete Premium",
        "Servicio de banquete gourmet con 3 tiempos, incluye meseros y vajilla",
        "por_invitado",
        850,
        "Banquete",
        "sí",
    ],
    [
        "DJ Profesional",
        "Servicio de DJ por 6 horas, incluye equipo de audio e iluminación básica",
        "fijo",
        25000,
        "Entretenimiento",
        "sí",
    ],
    [
        "Arreglo Floral Centro de Mesa",
        "Centro de mesa con flores naturales de temporada, base de cristal",
        "fijo",
        1200,
        "Decoración",
        "sí",
    ],
    [
        "Barra de Bebidas",
        "Barra libre premium con coctelería, cerveza artesanal y vinos nacionales. Precio por persona",
        "por_invitado",
        450,
        "Bebidas",
        "sí",
    ],
]

// Crear hoja con instrucciones
const instrucciones = [
    ["INSTRUCCIONES PARA EL TEMPLATE DE PRODUCTOS - EL ROMERAL"],
    [""],
    ["Columnas:"],
    ["• Título (obligatorio): Nombre del producto o servicio"],
    ["• Descripción: Descripción detallada del producto"],
    [
        '• Tipo de Precio (obligatorio): Escribir "fijo" para precio único o "por_invitado" para precio que varía por persona',
    ],
    ["• Precio (obligatorio): Valor numérico del precio en MXN (sin signo $)"],
    [
        "• Categoría: Nombre de la categoría. Si no existe, se creará automáticamente",
    ],
    ['• Activo: Escribir "sí" o "no". Si se deja vacío, se asume "sí"'],
    [""],
    ["NOTAS:"],
    ["• Las imágenes se pueden agregar después desde el panel de administración"],
    ["• No modificar los encabezados de la hoja 'Productos'"],
    [
        "• Las categorías se crean automáticamente si no existen en el sistema",
    ],
]

const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones)
wsInstrucciones["!cols"] = [{ wch: 90 }]

// Crear hoja de productos
const wsProductos = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
wsProductos["!cols"] = [
    { wch: 30 }, // Título
    { wch: 70 }, // Descripción
    { wch: 15 }, // Tipo de Precio
    { wch: 12 }, // Precio
    { wch: 20 }, // Categoría
    { wch: 10 }, // Activo
]

// Crear workbook
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones")
XLSX.utils.book_append_sheet(wb, wsProductos, "Productos")

// Guardar
XLSX.writeFile(wb, "public/templates/template-productos.xlsx")
console.log("✅ Template generado en public/templates/template-productos.xlsx")
