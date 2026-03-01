"use client"

import Image from "next/image"
import Link from "next/link"

export default function BrochurePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1️⃣ PORTADA */}
      <section className="relative h-screen flex items-center justify-center">
        <Image
          src="/images/pareja-jardin-dia.jpg"
          alt="El Romeral - Jardín con alma"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.15em] uppercase font-extralight leading-[1.1] mb-8 md:mb-12">
            El Romeral
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl tracking-[0.12em] font-light mb-8 md:mb-10">
            Un jardín con alma, diseñado para que todo fluya
          </h2>
          <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto opacity-95">
            Desde la llegada hasta el último baile, cada elemento está pensado para crear armonía.
          </p>
        </div>
      </section>

      {/* 2️⃣ NUESTRA ESENCIA */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-16 md:mb-20">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={200}
            height={90}
            className="w-32 md:w-40 h-auto opacity-90"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block">
              Nuestra esencia
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight">
              Más que un espacio, un lugar vivo
            </h3>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-foreground/90">
              <p>
                El Romeral es donde la naturaleza, el diseño y la operación trabajan juntos para crear celebraciones bien pensadas y bien ejecutadas.
              </p>
              <p>
                El jardín es el protagonista. Nosotros ayudamos a que su visión se integre naturalmente con él.
              </p>
            </div>
          </div>

          <div className="relative h-[500px] md:h-[600px]">
            <Image
              src="/images/romeral1.jpg"
              alt="Jardín de El Romeral"
              fill
              className="object-cover"
              quality={85}
            />
          </div>
        </div>
      </section>

      {/* 3️⃣ UNA FORMA DIFERENTE */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
              Cómo trabajamos
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto">
              Una forma diferente de vivir su evento
            </h3>
          </div>

          <div className="space-y-6 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            <p className="text-foreground/90">
              No trabajamos con paquetes. Cada celebración es distinta y las decisiones que toman reflejan quiénes son.
            </p>
            <p className="text-foreground/90">
              Ofrecemos acompañamiento cercano y estructurado desde el primer día. Desarrollamos juntos un proyecto completo del evento con decisiones, tiempos y detalles importantes.
            </p>
            <p className="text-foreground/90">
              Este proceso da claridad, orden y tranquilidad. Ustedes saben exactamente qué va a pasar, cómo y cuándo.
            </p>
          </div>
        </div>
      </section>

      {/* 4️⃣ TODO FLUYE EN UN SOLO LUGAR */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative h-[500px] md:h-[600px] order-2 md:order-1">
            <Image
              src="/images/capilla/capilla-ceremonia.jpg"
              alt="Ceremonia en El Romeral"
              fill
              className="object-cover"
              quality={85}
            />
          </div>

          <div className="space-y-6 order-1 md:order-2">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block">
              Sin traslados, sin tiempos muertos
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight">
              Todo fluye en un solo lugar
            </h3>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-foreground/90">
              <p>
                Ceremonia y celebración en un mismo espacio. No hay traslados, no hay esperas, no hay improvisaciones. Todo fluye de forma natural.
              </p>
              <p>
                Esta continuidad impacta la experiencia: los tiempos se respetan, la logística es limpia, y ustedes están presentes sin preocupaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ ESPACIOS QUE SE ADAPTAN */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
              El jardín como lienzo
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto">
              Espacios que se adaptan a su visión
            </h3>
          </div>

          <div className="space-y-12">
            <div className="space-y-4 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              <p className="text-foreground/90">
                El jardín tiene proporción, circulación natural y capacidad para hasta 400 invitados. Cada momento del evento tiene su lugar correcto.
              </p>
              <p className="text-foreground/90">
                Los árboles centenarios son estructura. La iluminación nocturna es parte del diseño. Todo está integrado para que construyan desde una base sólida.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="relative h-80">
                <Image
                  src="/images/romeral4oct25-32.jpg"
                  alt="Espacio de recepción"
                  fill
                  className="object-cover"
                  quality={85}
                />
              </div>
              <div className="relative h-80">
                <Image
                  src="/images/zabdi-acal-83.jpg"
                  alt="Montaje de cena"
                  fill
                  className="object-cover"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ TAL COMO LO SOÑARON */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block">
              Diseño y ambientación
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight">
              Tal como lo soñaron
            </h3>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-foreground/90">
              <p>
                Partimos de su visión y cuidamos cada detalle para que la decoración refleje su esencia.
              </p>
              <p>
                Sabemos qué funciona en este espacio, qué tiempos requiere cada montaje y cómo mantener la atmósfera correcta durante toda la noche.
              </p>
            </div>
          </div>

          <div className="relative h-[500px] md:h-[600px]">
            <Image
              src="/images/capitulo-iii-recepcion.jpg"
              alt="Ambientación de evento"
              fill
              className="object-cover"
              quality={85}
            />
          </div>
        </div>
      </section>

      {/* 7️⃣ UN PROCESO QUE DA TRANQUILIDAD */}
      <section className="py-24 md:py-32 bg-primary/5">
        <div className="px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
              Cómo funciona
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto">
              Un proceso que da tranquilidad
            </h3>
          </div>

          <div className="space-y-12">
            <div className="space-y-4 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              <p className="text-foreground/90">
                Desarrollamos juntos un proyecto completo del evento: imágenes de referencia, decisiones tomadas, momentos clave e itinerarios.
              </p>
              <p className="text-foreground/90">
                El objetivo es dar claridad y reducir ansiedad. Ustedes saben exactamente qué va a pasar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3 text-center">
                <h4 className="text-lg font-medium tracking-wide">Imágenes de referencia</h4>
                <p className="text-foreground/80 leading-relaxed">
                  Para visualizar juntos cada decisión
                </p>
              </div>

              <div className="space-y-3 text-center">
                <h4 className="text-lg font-medium tracking-wide">Momentos del evento</h4>
                <p className="text-foreground/80 leading-relaxed">
                  Cada etapa con su propósito y tiempo
                </p>
              </div>

              <div className="space-y-3 text-center">
                <h4 className="text-lg font-medium tracking-wide">Decisiones claras</h4>
                <p className="text-foreground/80 leading-relaxed">
                  Qué se acordó y por qué tiene sentido
                </p>
              </div>

              <div className="space-y-3 text-center">
                <h4 className="text-lg font-medium tracking-wide">Tiempos precisos</h4>
                <p className="text-foreground/80 leading-relaxed">
                  Para que el día fluya sin prisas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8️⃣ LOS DETALLES QUE MARCAN LA DIFERENCIA */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
            Lo que no se ve, pero se siente
          </span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto">
            Los detalles que marcan la diferencia
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Acompañamiento cercano</h4>
            <p className="text-foreground/80 leading-relaxed">
              Un equipo que conoce su evento tan bien como ustedes
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Proyecto visual completo</h4>
            <p className="text-foreground/80 leading-relaxed">
              Todo documentado: decisiones, tiempos, proveedores
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Servicio coordinado</h4>
            <p className="text-foreground/80 leading-relaxed">
              Atención fluida sin que sus invitados esperen
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Tiempos precisos</h4>
            <p className="text-foreground/80 leading-relaxed">
              Alimentos y bebidas en su momento exacto
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Atmósfera sonora</h4>
            <p className="text-foreground/80 leading-relaxed">
              Música coordinada para cada momento del evento
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-medium tracking-wide">Montaje incluido</h4>
            <p className="text-foreground/80 leading-relaxed">
              Pre y post montaje gestionados sin cargos extra
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-muted/40 border-l-4 border-primary max-w-3xl mx-auto">
          <p className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
            Muchas de estas cosas suceden sin que ustedes tengan que pedirlas. Llevamos años entendiendo qué hace que un evento funcione bien.
          </p>
        </div>
      </section>

      {/* 9️⃣ CÓMO SE CONSTRUYE LA INVERSIÓN */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
              Entendiendo la inversión
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto">
              ¿Cómo se construye la inversión?
            </h3>
          </div>

          <div className="space-y-12">
            <div className="space-y-6 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              <p className="text-foreground/90">
                La inversión se construye a partir de decisiones concretas: número de invitados, tipo de menú, ambientación, los momentos y extras que quieran agregar.
              </p>
              <p className="text-foreground/90">
                Para ayudarlos a entender esto, creamos un configurador en línea. Les permite explorar opciones y ver cómo se construye una propuesta.
              </p>
            </div>

            <div className="text-center pt-8">
              <Link
                href="/configurador"
                className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                Explorar configurador
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔟 EL SIGUIENTE PASO */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center space-y-8 md:space-y-12">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase opacity-60 font-medium block mb-6">
              Conocernos
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl tracking-[0.1em] uppercase font-extralight leading-tight max-w-3xl mx-auto mb-8">
              El siguiente paso
            </h3>
          </div>

          <div className="space-y-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            <p className="text-foreground/90">
              Conocer el espacio es el siguiente paso para saber si El Romeral es el lugar correcto para su celebración.
            </p>
            <p className="text-foreground/90 text-xl">
              Nosotros los guiamos.
              <br />
              Ustedes deciden.
            </p>
          </div>

          <div className="pt-8">
            <Link
              href="/#contacto"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              Agendar visita
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
