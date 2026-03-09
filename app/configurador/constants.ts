// Precios de instalaciones según número de personas
export const PRECIOS_INSTALACIONES = [
  { min: 1, max: 50, precio: 89000 },
  { min: 51, max: 100, precio: 119000 },
  { min: 101, max: 150, precio: 149000 },
  { min: 151, max: 200, precio: 159000 },
  { min: 201, max: 250, precio: 169000 },
  { min: 251, max: 300, precio: 179000 },
  { min: 301, max: 350, precio: 189000 },
  { min: 351, max: 400, precio: 199000 },
]

export const TABULADOR_INSTALACIONES = PRECIOS_INSTALACIONES

// Precios de comida por persona
export const PRECIO_MENU_3_TIEMPOS = 1340
export const PRECIO_PARRILLADA = 1450

export const PRECIOS_COMIDA = {
  tresTiempos: PRECIO_MENU_3_TIEMPOS,
  parrillada: PRECIO_PARRILLADA,
}

// Precios de bebidas
export const PRECIO_VINOS_LICORES = 660

// Precios de mesas
export const PRECIO_MESA_DEFAULT = 0
export const PRECIO_MESA_SHABBY_CHIC = 1350
export const PRECIO_MESA_MARMOL = 2650
export const PRECIO_MESA_REY_ARTURO = 2300
export const PRECIO_MESA_CRISTAL = 2650
export const PRECIO_MESA_PAROTA = 2650
export const PRECIO_MESA_NOVIOS = 26050 // Agregando precio de mesa de novios

export const PRECIOS_MESAS = {
  default: PRECIO_MESA_DEFAULT,
  shabbyChic: PRECIO_MESA_SHABBY_CHIC, // agregando límite de 6 para shabby chic
  marmol: PRECIO_MESA_MARMOL,
  reyArturo: PRECIO_MESA_REY_ARTURO,
  cristal: PRECIO_MESA_CRISTAL,
  parota: PRECIO_MESA_PAROTA,
  novios: PRECIO_MESA_NOVIOS,
}

// Límites de mesas
export const LIMITE_MESA_SHABBY_CHIC = 6
export const LIMITE_MESA_MARMOL = 6
export const LIMITE_MESA_REY_ARTURO = 2
export const LIMITE_MESA_CRISTAL = 4
export const LIMITE_MESA_PAROTA = 5

export const LIMITES_MESAS = {
  default: 999,
  shabbyChic: LIMITE_MESA_SHABBY_CHIC, // agregando límite de 6 para shabby chic
  marmol: LIMITE_MESA_MARMOL,
  reyArturo: LIMITE_MESA_REY_ARTURO,
  cristal: LIMITE_MESA_CRISTAL,
  parota: LIMITE_MESA_PAROTA,
}

// Precios de arreglos florales
export const PRECIOS_ARREGLOS_FLORALES = {
  rango1: 2180,
  rango2: 4090,
  rango3: 5680,
  rango4: 8670,
  rango5: 12350,
}

// Compatibilidad mesas-flores
export const COMPATIBILIDAD_MESAS_FLORES: Record<string, string[]> = {
  default: ["rango1", "rango2"],
  shabbyChic: ["rango2", "rango3"],
  marmol: ["rango2", "rango3"],
  reyArturo: ["rango3", "rango4", "rango5"], // Agregando rango3 a Rey Arturo
  cristal: ["rango1", "rango2"],
  parota: ["rango1", "rango2", "rango3"],
  novios: ["rango1", "rango2", "rango3", "rango4", "rango5"],
}

// Precios de toldos
export const PRECIO_TOLDO_PANORAMICO = 0
export const PRECIO_TOLDO_ALEMAN = 52000
export const PRECIO_TOLDO_PERSONALIZADO = 75000

// Precios de superficie
export const PRECIO_PASTO = 0
export const PRECIO_ENTARIMADO = 83000

// Precios de música - DJ
export const PRECIO_DJ_GRUPO_RESET = 21000
export const PRECIO_EQUIPO_SONIDO = 88500
export const PRECIO_CABINA_DJ = 0
export const PRECIO_ILUMINACION_ARQUITECTONICA = 32000
export const PRECIO_LUCES_ROBOTICAS = 34500

export const COSTOS_DJ = {
  grupoReset: PRECIO_DJ_GRUPO_RESET,
  equipoSonido: PRECIO_EQUIPO_SONIDO,
  cabinaDJ: PRECIO_CABINA_DJ,
  iluminacionArquitectonica: PRECIO_ILUMINACION_ARQUITECTONICA,
  lucesRoboticas: PRECIO_LUCES_ROBOTICAS,
}

// Precios de música - Grupo Musical
export const PRECIO_PLANTA_LUZ_GRUPO = 9100

export const PRECIO_PLANTA_LUZ = PRECIO_PLANTA_LUZ_GRUPO

// Precios de pista de baile
export const PRECIO_PISTA_ILUMINADA = 38000
export const PRECIOS_PISTA_PINTADA = [
  { min: 1, max: 50, precio: 22500, medida: "5 x 5" },
  { min: 51, max: 100, precio: 27000, medida: "5 x 6" },
  { min: 101, max: 150, precio: 32400, medida: "6 x 6" },
  { min: 151, max: 250, precio: 37800, medida: "6 x 7" },
  { min: 251, max: 400, precio: 44100, medida: "7 x 7" },
]

// Precio de capilla
export const PRECIO_CAPILLA = 20700

// Extras - Coordinación y Servicios Especiales
export const EXTRAS_COORDINACION = [
  { id: "coordinacion-hospedaje", nombre: "Coordinación de hospedaje y transporte", precio: 5000, porPersona: false },
  { id: "asistente-novio", nombre: "Asistente de novia/o por 6 horas", precio: 10000, porPersona: false },
  {
    id: "confirmacion-invitados",
    nombre: "Confirmación de invitados (3 llamadas y mensajes vía WhatsApp)",
    precio: 55,
    porPersona: true,
  },
  { id: "dinner-show", nombre: "Dinner Show (1 hora)", precio: 10000, porPersona: false },
  { id: "happening-saxofon", nombre: "Happening de saxofón", precio: 8000, porPersona: false },
]

// Extras - Alimentos y Estaciones Gastronómicas
export const EXTRAS_ALIMENTOS = [
  // Extras para desvelados
  {
    id: "buffet-antojitos",
    nombre: "Buffet de antojitos mexicanos",
    detalles: ["Pozole", "Chilaquiles", "Mini torta ahogada"],
    precio: 193,
    porPersona: true,
    nota: "desvelados",
  },
  {
    id: "tacos-barbacoa",
    nombre: "Tacos de barbacoa de hoyo",
    detalles: ["Servicio de 1.5 horas"],
    precio: 260,
    porPersona: true,
    nota: "desvelados",
  },
  {
    id: "tacos-vapor",
    nombre: "Tacos al vapor",
    detalles: ["4 piezas por persona"],
    precio: 135,
    porPersona: true,
    nota: "desvelados",
  },
  {
    id: "food-truck",
    nombre: "Food Truck Busway",
    detalles: ["Hot dogs", "Hamburguesas", "Papas locas", "Tostilokos"],
    precio: 310,
    porPersona: true,
    nota: "desvelados",
  },
  // Momentos de fiesta
  { id: "esquites", nombre: "Puesto de esquites", precio: 60, porPersona: true, nota: "fiesta" },
  {
    id: "candy-bar-alimentos",
    nombre: "Candy Bar o mesa de postres",
    precio: 245,
    porPersona: true,
    nota: "fiesta",
  },
  {
    id: "smores-alimentos",
    nombre: "S'mores / asador de bombones",
    precio: 53,
    porPersona: true,
    nota: "fiesta",
  },
  {
    id: "salty-bar",
    nombre: "Salty's Bar",
    detalles: ["Mesa de salados variados"],
    precio: 210,
    porPersona: true,
    nota: "fiesta",
  },
  // Durante recepción y coctelería
  {
    id: "carrito-helados-alimentos",
    nombre: "Carrito de helados personalizado",
    detalles: ["2 sabores a elegir", "1 hora de servicio"],
    precio: 125,
    porPersona: true,
    nota: "recepcion",
  },
  {
    id: "canapes-alimentos",
    nombre: "Charolas de canapés dulces y salados",
    detalles: ["Mezcla 50/50", "4 piezas por persona"],
    precio: 180,
    porPersona: true,
    nota: "recepcion",
  },
  {
    id: "mesa-quesos",
    nombre: "Mesa de quesos",
    detalles: ["8 variedades de quesos selectos"],
    precio: 225,
    porPersona: true,
    nota: "recepcion",
  },
  {
    id: "jabugo",
    nombre: "Jabugo",
    detalles: ["Pata de jamón ibérico de bellota", "Incluye cortador profesional", "Mínimo 100 personas"],
    precio: 355,
    porPersona: true,
    nota: "recepcion",
  },
]

// Extras - Bebidas
export const EXTRAS_BEBIDAS = [
  {
    id: "barra-cafe",
    nombre: "Barra de café",
    detalles: [
      "Frapuccino",
      "Cappuccino",
      "Moka",
      "Latte",
      "Americano",
      "Espresso",
      "Irlandés",
      "Carajillo",
      "2 horas de servicio con el postre",
    ],
    precio: 155,
    porPersona: true,
  },
  {
    id: "cafe-americano",
    nombre: "Servicio solo de café americano",
    precio: 66,
    porPersona: true,
  },
  {
    id: "electrolit",
    nombre: "Electrolit 950 ml",
    detalles: ["Colocado en tinas de hielo", "Para salida del evento"],
    precio: 53,
    porPersona: true,
  },
  {
    id: "carrito-cerveza",
    nombre: "Carrito de cerveza artesanal Romeral",
    detalles: ["Carrito de parota personalizado", "2 tipos de cerveza", "40 litros incluidos"],
    precio: 20300,
    porPersona: false,
  },
]

// Extras - Decoración Especial
export const EXTRAS_DECORACION = [
  {
    id: "arbol-gigante",
    nombre: "Árbol gigante decorativo",
    detalles: ["Follaje en seda", "Luz en la base", "10 vasos colgantes"],
    precio: 34500,
    porPersona: false,
  },
]

// Extras - Tiempos Extra
export const EXTRAS_TIEMPO = [
  {
    id: "tiempo-extra",
    nombre: "Tiempo extra en banquete de alimentos",
    precio: 160,
    porPersona: true,
    requiereTipoComida: "menu3tiempos",
  },
]

// Extras agrupados por categorías
export const EXTRAS_CATEGORIAS = {
  coordinacion: {
    titulo: "Coordinación y Servicios Especiales",
    icono: "coordinacion",
    items: EXTRAS_COORDINACION,
  },
  alimentos: {
    titulo: "Alimentos y Estaciones Gastronómicas",
    icono: "alimentos",
    items: EXTRAS_ALIMENTOS,
  },
  bebidas: {
    titulo: "Bebidas",
    icono: "bebidas",
    items: EXTRAS_BEBIDAS,
  },
  decoracion: {
    titulo: "Decoración Especial",
    icono: "decoracion",
    items: EXTRAS_DECORACION,
  },
  tiempo: {
    titulo: "Tiempos Extra",
    icono: "tiempo",
    items: EXTRAS_TIEMPO,
  },
}

// Días festivos oficiales México 2026 y 2027
export const DIAS_FESTIVOS = [
  "2026-01-01",
  "2026-02-02",
  "2026-03-16",
  "2026-05-01",
  "2026-09-16",
  "2026-11-16",
  "2026-12-25",
  "2027-01-01",
  "2027-02-01",
  "2027-03-15",
  "2027-05-01",
  "2027-06-06",
  "2027-09-16",
  "2027-11-15",
  "2027-12-25",
]
