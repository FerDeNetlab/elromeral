"use client"

import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

export default function ExperienciaBienvenidaPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 bg-background flex items-center justify-center">
        <div className="text-center text-foreground px-6 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase font-extralight leading-[1.1] mb-6 md:mb-10">
            Experiencia de Bienvenida Romeral
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto opacity-90 tracking-wide">
            Un espacio pensado para recibir a tus invitados con comodidad, frescura y detalles que elevan el primer momento de la celebración
          </p>
        </div>
      </section>

      {/* Logo Section */}
      <section className="py-16 md:py-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-center">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={200}
            height={90}
            className="w-32 md:w-40 h-auto opacity-90"
          />
        </div>
      </section>

      {/* Main Description */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center space-y-8">
          <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block">
            La experiencia
          </span>
          <p className="text-lg md:text-xl leading-relaxed text-foreground/90 font-light max-w-3xl mx-auto">
            Esta experiencia integra mobiliario lounge de diseño, áreas de descanso, servicio de hidratación y un carrito de nieves artesanal, creando un ambiente relajado, estético y funcional para la bienvenida de tus invitados.
          </p>
        </div>
      </section>

      {/* Sección 1: Mobiliario Lounge */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative h-[400px] md:h-[550px]">
            <Image
              src="/images/experiencia/columpio-parota.jpeg"
              alt="Mobiliario Lounge"
              fill
              className="object-cover"
              quality={85}
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-4">
                01
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] uppercase font-extralight leading-tight mb-6">
                Mobiliario Lounge
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light mb-8">
                Áreas de descanso diseñadas para crear un ambiente acogedor y sofisticado desde el primer momento.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Banca de parota</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Columpio de parota</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Sala lounge para 6 personas</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Sombrilla</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 2: Carrito de Nieves */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto bg-muted/20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8 order-2 md:order-1">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-4">
                02
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] uppercase font-extralight leading-tight mb-6">
                Carrito de Nieves
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light mb-8">
                Un carrito artesanal de madera con sombrilla estilo francés, diseñado para sorprender a tus invitados con un detalle refrescante y memorable.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">60 nieves en barquillo</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Carrito de nieves tipo bar</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Sombrilla con flecos</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Personal de atención</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-foreground/10">
              <p className="text-sm text-foreground/60 font-light italic leading-relaxed">
                * 1 solo sabor. Tiempo de 30 min o hasta agotar existencias (lo primero que ocurra)
              </p>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[550px] order-1 md:order-2">
            <Image
              src="/images/experiencia/carrito-nieves-sombrilla.jpeg"
              alt="Carrito de nieves con sombrilla"
              fill
              className="object-cover"
              quality={85}
            />
          </div>
        </div>
      </section>

      {/* Sección 3: Barra de Aguas + Sombrillas */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative h-[400px] md:h-[550px]">
            <Image
              src="/images/experiencia/barra-aguas-piscina.png"
              alt="Barra de aguas y sombrillas"
              fill
              className="object-cover"
              quality={85}
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-4">
                03
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] uppercase font-extralight leading-tight mb-6">
                Barra de Aguas + Sombrilla
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light mb-8">
                Una estación de hidratación completa para que tus invitados se mantengan frescos y cómodos durante la celebración.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Sombrilla 3 x 3 m</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Barra para servicio de aguas</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">75 aguas</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Hielera e hielo</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" strokeWidth={2.5} />
                <p className="text-base leading-relaxed text-foreground/90">Personal de atención</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-8">
            Inversión
          </span>
          
          <div className="bg-background border border-primary/10 py-16 px-8 md:px-12">
            <p className="text-sm tracking-[0.25em] uppercase text-foreground/60 mb-4 font-medium">
              Inversión total
            </p>
            <p className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-wider text-primary mb-4">
              $15,400
            </p>
            <p className="text-base tracking-[0.15em] uppercase text-foreground/70 font-light mb-3">
              MXN
            </p>
            <p className="text-sm text-foreground/60 font-light">
              * Antes de IVA
            </p>
          </div>

          <p className="text-sm md:text-base text-foreground/70 font-light mt-12 leading-relaxed max-w-2xl mx-auto">
            Una experiencia de bienvenida que refleja el cuidado y la atención que merece tu celebración
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.12em] uppercase font-extralight leading-tight mb-12">
          ¿Te gustaría conocer más sobre esta experiencia?
        </h3>
        
        <Link
          href="https://wa.me/3338708159?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20la%20Experiencia%20de%20Bienvenida%20Romeral"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary text-primary-foreground px-12 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors duration-500"
        >
          Escríbenos por WhatsApp
        </Link>
      </section>

      {/* Footer Spacer */}
      <div className="h-20" />
    </main>
  )
}
