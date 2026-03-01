"use client";

import Image from "next/image";
import Link from "next/link";

export default function OnePagerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 1️⃣ ENCABEZADO */}
      <section className="relative min-h-[70vh] flex items-center justify-center">
        <Image
          src="/images/pareja-jardin-dia.jpg"
          alt="El Romeral"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto py-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.15em] uppercase font-extralight leading-[1.1] mb-6 md:mb-8">
            El Romeral
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl tracking-[0.12em] font-light mb-8">
            Un jardín con alma, diseñado para que todo fluya
          </h2>
          <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed opacity-95">
            Desde la llegada de sus invitados hasta el último baile, cada elemento está pensado para crear armonía.
            <br className="hidden sm:block" />
            Ustedes eligen cómo vivirlo. Nosotros los guiamos para que todo fluya perfecto.
          </p>
        </div>
      </section>

      {/* Logo */}
      <div className="flex justify-center py-12 md:py-16">
        <Image
          src="/images/el-romeral-logo-nuevo.png"
          alt="El Romeral"
          width={200}
          height={90}
          className="w-32 md:w-40 h-auto opacity-90"
        />
      </div>

      {/* 2️⃣ ¿QUÉ ES EL ROMERAL? */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-8 text-foreground">
          ¿Qué es El Romeral?
        </h3>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          El Romeral no es solo un venue. Es un espacio donde la naturaleza, el diseño y la operación trabajan en conjunto para crear celebraciones bien pensadas y bien ejecutadas.
        </p>
      </section>

      {/* 3️⃣ ¿POR QUÉ ES DIFERENTE? */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-12 text-center text-foreground">
            ¿Por qué es diferente?
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            <div className="flex gap-4 items-start">
              <span className="text-primary text-2xl">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                No trabajamos con paquetes predeterminados
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-primary text-2xl">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                No operamos como wedding planner tradicional
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-primary text-2xl">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Todo sucede en un solo lugar
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-primary text-2xl">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Acompañamiento cercano y ordenado
              </p>
            </div>
            <div className="flex gap-4 items-start sm:col-span-2">
              <span className="text-primary text-2xl">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Cada decisión tiene sentido dentro de una experiencia integral
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ UN PROCESO QUE DA TRANQUILIDAD */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-10 text-center text-foreground">
          Un proceso que da tranquilidad
        </h3>
        <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/90 max-w-3xl mx-auto">
          <p>
            Desde el inicio los acompañamos de cerca. Juntos desarrollamos un proyecto del evento que documenta todas sus decisiones: momentos, tiempos e itinerarios.
          </p>
          <p>
            El objetivo es darles claridad y tranquilidad. Saber que todo está ordenado y que cada detalle se ejecutará como lo planearon.
          </p>
        </div>
      </section>

      {/* 5️⃣ LOS DETALLES QUE MARCAN LA DIFERENCIA */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-12 text-center text-foreground">
            Los detalles que marcan la diferencia
          </h3>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Acompañamiento cercano durante todo el proceso
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Proyecto claro del evento
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Servicio suficiente y bien coordinado
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Temperaturas y tiempos correctos para alimentos y bebidas
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                La música y sus momentos
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Estacionamiento amplio y ordenado
              </p>
            </div>
            <div className="flex gap-3 items-start sm:col-span-2">
              <span className="text-primary text-xl mt-1">•</span>
              <p className="text-base leading-relaxed text-foreground/90">
                Pre y post montaje bien gestionados y sin precios extra
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ ¿CÓMO SE CONSTRUYE LA INVERSIÓN? */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-10 text-center text-foreground">
          ¿Cómo se construye la inversión?
        </h3>
        <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/90 max-w-3xl mx-auto">
          <p>
            No trabajamos con paquetes. La inversión se construye a partir de sus decisiones: número de invitados, tipo de menú, ambientación, los momentos y extras que quieran agregar.
          </p>
          <p>
            Para ayudarlos a entender esto, creamos un configurador de experiencias en línea. Les permite explorar opciones y ver cómo se construye una propuesta.
          </p>
        </div>
      </section>

      {/* 7️⃣ EL SIGUIENTE PASO */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl tracking-[0.12em] uppercase font-light mb-8 text-foreground">
            El siguiente paso
          </h3>
          <div className="space-y-6 text-base md:text-lg leading-relaxed text-foreground/90 mb-12">
            <p className="text-lg md:text-xl">
              Conocer el espacio es el siguiente paso para saber si El Romeral es el lugar correcto para su celebración.
            </p>
            <p className="text-lg md:text-xl font-light">
              Nosotros los guiamos.
              <br />
              Ustedes deciden.
            </p>
          </div>
          
          <Link
            href="/configurador"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors duration-500"
          >
            Explorar Experiencias
          </Link>
        </div>
      </section>

      {/* Nota interna */}
      <div className="py-8 px-6 text-center text-xs text-muted-foreground/60">
        <p>One-page brochure – Versión base</p>
        <p>Contenido en construcción, sujeto a ajustes de diseño e imagen.</p>
      </div>
    </div>
  );
}
