"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Section {
  id: string
  title: string
  subtitle: string
  content: string[]
}

const sections: Section[] = [
  {
    id: "punto-partida",
    title: "Punto de partida real",
    subtitle: "La calidad ya existe. Lo que estamos construyendo es sistema.",
    content: [
      "Romeral hoy tiene:",
      "",
      "• 6-8 bodas anuales.",
      "• Capacidad operativa para hasta 12 bodas al año.",
      "• Ticket promedio entre $600K y $1M.",
      "• Margen aproximado del 60%.",
      "• Ejecución del dia del evento casi impecable.",
      "• Clientes que confian en el servicio.",
      "",
      "Ademas, cerramos con 12-18 meses de anticipación.",
      "Eso significa que lo que estructuremos en 2026 impacta 2027 y 2028.",
      "",
      "Romeral no está mal.",
      "Romeral está en transición.",
    ],
  },
  {
    id: "de-donde-venimos",
    title: "De donde venimos",
    subtitle: "El modelo anterior funcionó. Pero hoy nos limita.",
    content: [
      "Modelo tradicional:",
      "",
      "Lead > Brochure > Visita > 'Ejercicio de presupuesto' en Excel > Cierre.",
      "",
      "El brochure comunicaba:",
      "• Infraestructura sólida.",
      "• Jardines, lago y capilla.",
      "• Dos modalidades:",
      "• Renta de instalaciones.",
      "• Experiencia Integral.",
      "",
      "Durante años funcionó.",
      "",
      "Pero generó fricciones estructurales que hoy limitan el crecimiento.",
    ],
  },
  {
    id: "problemas-estructurales",
    title: "Problemas estructurales del modelo anterior",
    subtitle: "El problema no era el precio. Era el marco mental antes del precio.",
    content: [
      "A) Visitas sin presupuesto claro",
      "",
      "No se preguntaba inversión al inicio.",
      "",
      "Se recibía al cliente con la esperanza de que 'le alcanzara'.",
      "",
      "Consecuencias:",
      "• Pérdida de tiempo.",
      "• Desgaste operativo.",
      "• Expectativas desalineadas.",
      "",
      "⸻",
      "",
      "B) El 'ejercicio de presupuesto' generaba choque",
      "",
      "Cuando aparecía el Excel:",
      "• El cliente con menor presupuesto decía:",
      "'Pensé que iba a costar menos.'",
      "• El cliente con capacidad decía:",
      "'Se me hace caro para un paquete.'",
      "",
      "El problema no era el número.",
      "Era el marco mental previo al número.",
      "",
      "La Experiencia Integral se percibía como paquete.",
      "Y lo que se percibe como paquete, se compara como paquete.",
      "",
      "No se comparaba contra:",
      "• Tranquilidad.",
      "• Direccion profesional.",
      "• Ejecución impecable.",
      "• Control total del evento.",
      "",
      "⸻",
      "",
      "C) La Experiencia Integral se devaluaba sin querer",
      "",
      "Para incentivar cierre se comunicaba:",
      "• Coordinación incluida.",
      "• Precio especial en renta.",
      "• Diferencia comparativa de $20K.",
      "",
      "Pero en realidad:",
      "",
      "Romeral ejecuta aproximadamente el 70-80% del trabajo de un wedding planner profesional.",
      "",
      "Al comunicarlo como 'cortesía':",
      "• No se valora.",
      "• Se da por hecho.",
      "• Se mete en categoría de paquete.",
      "",
      "Eso baja el estándar percibido.",
      "",
      "⸻",
      "",
      "D) Proceso de adicionales poco visual",
      "",
      "El presupuesto en Excel era:",
      "• Largo.",
      "• Abrumador.",
      "• Poco guiado.",
      "",
      "No existia:",
      "• Mapa visual del proceso.",
      "• Fases claras.",
      "• Construccion progresiva del evento.",
      "",
      "La novia no veia la evolucion de su boda.",
      "Solo veia números acumulados.",
      "",
      "Eso limita el crecimiento del ticket.",
    ],
  },
  {
    id: "que-cambio",
    title: "Que cambio",
    subtitle: "El mercado evoluciono. Romeral también debe hacerlo.",
    content: [
      "El mercado cambio.",
      "",
      "La novia hoy:",
      "• Investiga mas.",
      "• Compara mas.",
      "• Evalua experiencia antes que lista de servicios.",
      "• Decide emocionalmente.",
      "",
      "Romeral comenzo a evolucionar:",
      "• Landing moderna.",
      "• Configurador.",
      "• Automatizacion de agenda.",
      "• Incursion tecnologica con Netlab.",
      "",
      "Esto no es error.",
      "",
      "Es profesionalizacion.",
      "",
      "Pero estamos en etapa intermedia y debemos cerrarla correctamente.",
    ],
  },
  {
    id: "redefinicion",
    title: "Redefinicion 2026",
    subtitle: "No vendemos renta. Vendemos sistema integral de diseño y ejecucion.",
    content: [
      "Romeral deja de vender:",
      "",
      "'Renta + cosas incluidas.'",
      "",
      "Romeral empieza a vender:",
      "",
      "Sistema integral de diseño y ejecucion.",
      "",
      "No es paquete.",
      "No es combo.",
      "No es descuento.",
      "",
      "Es dirección profesional.",
    ],
  },
  {
    id: "nuevo-modelo",
    title: "Nuevo Modelo Estructural 2026",
    subtitle: "Primero sistema. Luego crecimiento.",
    content: [
      "1. Redes con narrativa clara",
      "",
      "• 80% contenido enfocado en bodas.",
      "• 20% eventos sociales.",
      "• Comunicacion basada en dirección, control y experiencia.",
      "• No solo fotos bonitas: autoridad y seguridad.",
      "",
      "⸻",
      "",
      "2. Entrada de lead unificada",
      "",
      "Todos los leads entran al mismo sistema:",
      "• Instagram",
      "• Facebook",
      "• WhatsApp",
      "• Llamadas",
      "",
      "Nada disperso.",
      "",
      "⸻",
      "",
      "3. Filtro economico real",
      "",
      "Se comunica rango real desde el inicio.",
      "",
      "Objetivo:",
      "• El cliente no alineado se autofiltra.",
      "• El cliente alineado llega con intencion real.",
      "",
      "Se elimina la esperanza.",
      "Se construye intencion.",
      "",
      "⸻",
      "",
      "4. Simulador con contexto",
      "",
      "No cotizador frio.",
      "",
      "Simulador estructurado que muestra:",
      "• Base.",
      "• Que incluye.",
      "• Que suele agregarse.",
      "• Por que se agrega.",
      "• Rango final probable.",
      "",
      "El número deja de ser sorpresa.",
      "Se vuelve consecuencia logica.",
      "",
      "⸻",
      "",
      "5. Sistema Visual de Construccion del Evento",
      "",
      "Una boda que inicia en $600K puede evolucionar a $800K-$900K si el cliente se enamora visualmente.",
      "",
      "El ticket no se sube con descuentos.",
      "Se sube con vision estructurada.",
      "",
      "Fases:",
      "• Base estructural.",
      "• Diseño floral.",
      "• Produccion e iluminacion.",
      "• Experiencia sensorial.",
      "• Momentos especiales.",
      "",
      "⸻",
      "",
      "6. Sistema interno profesional",
      "",
      "• Calendario digital.",
      "• Control de pagos.",
      "• Contratos ordenados.",
      "• Timeline visual del evento.",
      "• Checklist operativo.",
      "• Control estructurado de adicionales.",
      "",
      "La promesa emocional se sostiene con orden real.",
    ],
  },
  {
    id: "enfoque-estrategico",
    title: "Enfoque estrategico",
    subtitle: "Especializacion eleva. Generalizacion diluye.",
    content: [
      "Romeral sera principalmente marca de bodas.",
      "",
      "Se seguiran realizando:",
      "• XV años.",
      "• Posadas.",
      "• Bautizos.",
      "• Cumpleaños.",
      "",
      "Pero:",
      "• No seran el foco narrativo.",
      "• No definiran el posicionamiento principal.",
      "",
      "Especializacion eleva.",
      "Generalizacion diluye.",
    ],
  },
  {
    id: "mercado-top",
    title: "Mercado 'Top' - Realidad Estrategica",
    subtitle: "Primero sistema. Luego reputacion. Luego circulo.",
    content: [
      "El mercado ultra top funciona por:",
      "• Redes cerradas.",
      "• Wedding planners consólidados.",
      "• Relaciones historicas.",
      "• Recomendacion social.",
      "",
      "No por anuncios ni revistas pagadas.",
      "",
      "Podemos llegar?",
      "",
      "Si, pero como consecuencia de:",
      "• Subir ticket sostenido arriba de $1M.",
      "• Elevar estándar visual.",
      "• Generar 2-3 eventos al año que circulen en ese nivel.",
      "• Construir reputacion constante.",
      "",
      "Es un proceso de 2-3 años.",
      "No una campana inmediata.",
    ],
  },
  {
    id: "objetivo-2026",
    title: "Objetivo 2026",
    subtitle: "2026 es año de arquitectura.",
    content: [
      "• Subir ticket promedio.",
      "• Mejorar calidad de leads.",
      "• Reducir desgaste operativo.",
      "• Profesionalizar estructura interna.",
      "• Construir pipeline solido para 2027-2028.",
      "• Consólidar enfoque en bodas.",
      "",
      "Primero sistema.",
      "Luego reputacion.",
      "Luego circulo.",
    ],
  },
]

export default function ManifiestoPage() {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero - Not Collapsible */}
      <section className="relative py-20 md:py-32 px-6 text-center border-b border-foreground/10">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase font-extralight leading-tight">
            Romeral 2026
          </h1>
          <p className="text-sm md:text-base tracking-[0.2em] uppercase text-muted-foreground font-light">
            Transicion Estrategica, Profesionalizacion y Enfoque Definitivo
          </p>

          <div className="pt-8 space-y-4">
            <p className="text-xl md:text-2xl font-light leading-relaxed">
              Romeral no está mal.
            </p>
            <p className="text-xl md:text-2xl font-light leading-relaxed">
              Romeral está en transición.
            </p>
          </div>

          <div className="pt-8">
            <button
              onClick={() => {
                document.getElementById("sections")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="px-8 py-3 border border-foreground/20 hover:bg-foreground/5 transition-colors duration-300 text-sm tracking-[0.15em] uppercase"
            >
              Explorar vision 2026
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Sections */}
      <section id="sections" className="py-16 md:py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          {sections.map((section) => {
            const isOpen = openSections.includes(section.id)

            return (
              <div key={section.id} className="border border-foreground/10 bg-background">
                {/* Section Header - Always Visible */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-8 md:px-12 py-8 text-left hover:bg-foreground/[0.02] transition-colors duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <h2 className="text-xl md:text-2xl tracking-[0.1em] uppercase font-light">
                        {section.title}
                      </h2>
                      <p className="text-sm md:text-base text-foreground/70 font-light italic leading-relaxed">
                        {section.subtitle}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Section Content - Expandable */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-8 md:px-12 pb-8 pt-4 border-t border-foreground/10">
                    <div className="prose prose-sm md:prose-base max-w-none">
                      {section.content.map((paragraph, idx) => {
                        if (paragraph === "---") {
                          return (
                            <div key={idx} className="my-8 text-center text-foreground/20">
                              ---
                            </div>
                          )
                        }

                        if (paragraph === "") {
                          return <div key={idx} className="h-4" />
                        }

                        if (paragraph.startsWith("•")) {
                          return (
                            <p key={idx} className="text-foreground/80 leading-relaxed pl-4">
                              {paragraph}
                            </p>
                          )
                        }

                        if (paragraph === "⸻") {
                          return (
                            <div key={idx} className="my-8 border-t border-foreground/10" />
                          )
                        }

                        return (
                          <p key={idx} className="text-foreground/80 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Final Section - Not Collapsible */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-foreground/10">
        <div className="space-y-8 text-center">
          <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light">
            Conclusion
          </h2>

          <div className="space-y-6 text-foreground/80">
            <p className="text-lg md:text-xl font-light leading-relaxed">
              Romeral no necesita improvisacion.
            </p>

            <div className="pt-4 space-y-3 text-base md:text-lg leading-relaxed">
              <p>Necesita:</p>
              <p className="pl-4">• Definicion.</p>
              <p className="pl-4">• Filtro claro.</p>
              <p className="pl-4">• Valor explicito.</p>
              <p className="pl-4">• Sistema visual.</p>
              <p className="pl-4">• Especializacion.</p>
              <p className="pl-4">• Profesionalizacion digital.</p>
            </div>

            <div className="pt-8 space-y-4 text-base md:text-lg leading-relaxed">
              <p>La tecnologia no reemplaza la esencia.</p>
              <p>La ordena.</p>
              <p>La protege.</p>
              <p>La escala.</p>
              <p className="pt-8 font-medium">
                Si estructuramos bien 2026,
              </p>
              <p className="font-medium">
                2027 y 2028 creceran por sistema,
              </p>
              <p className="font-medium">
                no por suerte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
