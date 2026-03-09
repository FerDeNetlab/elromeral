"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState } from "react"

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-[60] md:hidden cursor-pointer p-2 bg-background/90 backdrop-blur-sm border border-primary/10"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay - solo visible cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Nav panel */}
      <nav
        className={`fixed left-0 top-0 h-screen w-64 z-[60] flex flex-col items-start justify-between py-16 px-8 border-r border-primary/10 bg-background transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 cursor-pointer p-2"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>

        <Link href="/" className="hover:opacity-70 transition-opacity duration-500">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={80}
            height={40}
            className="object-contain"
          />
        </Link>

        <div className="flex flex-col gap-8 text-sm tracking-[0.2em] uppercase font-medium">
          <a
            href="#esencia"
            onClick={() => setIsOpen(false)}
            className="hover:text-primary transition-colors duration-500 block"
          >
            Esencia
          </a>
          <Link
            href="/configurador"
            onClick={() => setIsOpen(false)}
            className="hover:text-primary transition-colors duration-500 block"
          >
            Cotiza
          </Link>
          <Link
            href="/galeria"
            onClick={() => setIsOpen(false)}
            className="hover:text-primary transition-colors duration-500 block"
          >
            Galería
          </Link>
          <Link
            href="/planners"
            onClick={() => setIsOpen(false)}
            className="hover:text-primary transition-colors duration-500 block"
          >
            Planners
          </Link>
          <a
            href="#guias"
            onClick={() => setIsOpen(false)}
            className="hover:text-primary transition-colors duration-500 block"
          >
            Guías
          </a>
        </div>
      </nav>
    </>
  )
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-36 lg:w-44 z-50 flex-col items-start justify-between py-16 px-6 lg:px-8 border-r border-primary/10 bg-background/95 backdrop-blur-xl">
      <Link href="/" className="hover:opacity-70 transition-opacity duration-500">
        <Image
          src="/images/el-romeral-logo-nuevo.png"
          alt="El Romeral"
          width={90}
          height={45}
          className="object-contain"
        />
      </Link>

      <div className="flex flex-col gap-10 text-xs lg:text-sm tracking-[0.2em] uppercase font-medium">
        <a href="#esencia" className="hover:text-primary hover:translate-x-1 transition-all duration-500">
          Esencia
        </a>
        <Link href="/configurador" className="hover:text-primary hover:translate-x-1 transition-all duration-500">
          Cotiza
        </Link>
        <Link href="/galeria" className="hover:text-primary hover:translate-x-1 transition-all duration-500">
          Galería
        </Link>
        <Link href="/planners" className="hover:text-primary hover:translate-x-1 transition-all duration-500">
          Planners
        </Link>
        <a href="#guias" className="hover:text-primary hover:translate-x-1 transition-all duration-500">
          Guías
        </a>
      </div>
    </nav>
  )
}

function FloatingCTA() {
  return (
    <Link
      href="/configurador"
      className="fixed top-6 right-6 z-[70] px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-background/40 backdrop-blur-md border border-primary/20 text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.25em] uppercase font-light text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-700 hover:scale-105 transform shadow-lg hover:shadow-2xl"
    >
      Personaliza y cotiza tu boda
    </Link>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileNav />
      <DesktopNav />
      <FloatingCTA />

      <main className="md:ml-36 lg:ml-44">
        {/* Hero Section */}
        <section className="relative h-[100svh] w-full overflow-hidden bg-[#1a1f16]">
          <div className="absolute inset-0 bg-[#1a1f16]">
            {/* Hero optimizado con sizes responsivos y calidad adaptativa */}
            <Image
              src="/images/elromeral-1-282-29.jpg"
              alt="El Romeral Gardens"
              fill
              priority
              loading="eager"
              fetchPriority="high"
              quality={85}
              sizes="100vw"
              className="object-cover scale-105 animate-[zoom_30s_ease-out_forwards] will-change-transform"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 md:px-8">
            <span className="text-xs sm:text-sm md:text-base tracking-[0.1em] md:tracking-[0.18em] uppercase font-light opacity-60 mb-6 md:mb-8 animate-fade-in text-center">
              Jardín Natural · Zapopan, México
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-[0.15em] md:tracking-[0.25em] uppercase font-extralight mb-8 md:mb-12 text-balance text-center animate-fade-in-up">
              El Romeral
            </h1>
            <p className="text-xs sm:text-sm md:text-base tracking-[0.1em] md:tracking-[0.18em] font-light max-w-xs sm:max-w-md md:max-w-2xl text-center leading-relaxed opacity-90 animate-fade-in-delayed">
              Ustedes lo viven. Nosotros cuidamos cada detalle.
            </p>
          </div>
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 animate-bounce-slow">
            <div className="w-[1px] h-12 md:h-16 bg-white/40" />
          </div>
        </section>

        {/* Personalización Section */}
        <section
          id="personalizar"
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 lg:px-24 text-center">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary/60 block mb-8 md:mb-12 font-medium animate-fade-in">
              Comiencen a Construir Su Historia
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.08em] md:tracking-[0.12em] uppercase font-extralight leading-[1.1] mb-8 md:mb-12 text-foreground animate-fade-in-up">
              Diseñen
              <br />Su Experiencia
              <br />
              Paso a Paso
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.08em] md:tracking-[0.12em] font-light leading-relaxed mb-8 md:mb-10 text-muted-foreground max-w-xs sm:max-w-md md:max-w-3xl text-center animate-fade-in-delayed">
              Desde la llegada de sus invitados hasta el último baile, cada elemento está pensado para crear armonía. Ustedes eligen cómo vivirlo. Nosotros los guiamos para que todo fluya perfecto.
            </p>
            <Link
              href="/configurador"
              className="relative z-10 inline-block border border-primary/20 px-8 sm:px-10 md:px-14 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase font-light hover:bg-primary/5 hover:border-primary/40 transition-all duration-500 text-foreground/80 hover:text-foreground"
            >
              Personaliza y cotiza tu boda
            </Link>
          </div>
          <div className="absolute top-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-40 h-40 md:w-64 md:h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
        </section>

        {/* Esencia Section */}
        <section
          id="esencia"
          className="py-20 md:py-32 lg:py-48 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-background"
        >
          <div className="max-w-4xl mx-auto">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary/60 block mb-6 md:mb-8 font-medium">
              Nuestra Esencia
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.08em] md:tracking-[0.12em] uppercase font-extralight leading-[1.1] mb-10 md:mb-16 text-primary">
              Un jardín
              <br />
              con alma
            </h2>
            <div className="space-y-6 md:space-y-8 text-muted-foreground">
              <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed">
                El Romeral es más que un venue. Es un espacio diseñado para crear celebraciones en armonía, donde ustedes eligen cómo vivirlo y nosotros nos encargamos de que todo fluya.
              </p>
            </div>
          </div>
        </section>

        {/* Elementos Naturales Section */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden group">
            {/* Mejorando quality to 80 for better definition */}
            <Image
              src="/images/capitulo-i-landing.jpg"
              alt="Capilla El Romeral"
              fill
              quality={80}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA=="
              className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 md:bottom-16 left-6 right-6 md:left-12 md:right-12 text-white">
              <span className="text-xs tracking-[0.25em] uppercase opacity-60 block mb-3 md:mb-4 font-medium">
                Capítulo I
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] md:tracking-[0.15em] uppercase font-light mb-3 md:mb-4">
                La Promesa
              </h3>
              <p className="text-xs sm:text-sm font-light leading-relaxed opacity-90 max-w-md">
                El escenario perfecto para jurarse amor eterno, donde las fuentes danzan al ritmo de sus votos
              </p>
            </div>
          </div>
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden group">
            {/* Mejorando quality to 80 */}
            <Image
              src="/images/pareja-jardin-dia.jpg"
              alt="Pareja de novios bajo la bóveda natural de árboles centenarios"
              fill
              quality={80}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 md:bottom-16 left-6 right-6 md:left-12 md:right-12 text-white">
              <span className="text-xs tracking-[0.25em] uppercase opacity-60 block mb-3 md:mb-4 font-medium">
                Capítulo II
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] md:tracking-[0.15em] uppercase font-light mb-3 md:mb-4">
                Bajo El Abrazo De Los Árboles
              </h3>
              <p className="text-xs sm:text-sm font-light leading-relaxed opacity-90 max-w-md">
                Los árboles centenarios forman una bóveda natural que protege cada promesa. La luz del día se filtra entre las hojas, los caminos de piedra guían cada paso, y el jardín se convierte en testigo silencioso de su historia de amor.
              </p>
            </div>
          </div>
        </section>

        {/* Capítulo III Section */}
        <section id="capitulo-iii" className="relative min-h-screen w-full flex items-center overflow-hidden bg-black">
          <div className="absolute inset-0">
            {/* Changing to priority and quality 80 */}
            <Image
              src="/images/capitulo-iii-recepcion.jpg"
              alt="Recepción elegante El Romeral"
              fill
              quality={80}
              loading="lazy"
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA=="
              className="object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/30" />
          <div className="relative z-10 text-center text-white px-6 md:px-8 max-w-4xl mx-auto py-20 md:py-32">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase opacity-60 block mb-6 md:mb-8 font-medium">
              Capítulo III · Celebración
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.1em] md:tracking-[0.18em] uppercase font-extralight leading-[1.05] mb-8 md:mb-12">
              Tal como
              <br />
              lo soñaron
            </h2>
            <p className="text-sm sm:text-sm md:text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto">
              Partimos de su visión y cuidamos cada detalle para que la decoración refleje su esencia y el día se viva exactamente como lo imaginaron.
            </p>
          </div>
        </section>

        {/* Capítulo II Section */}
        <section id="capitulo-ii" className="relative min-h-screen w-full flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {/* Changing to priority and quality 80 */}
            <Image
              src="/images/elromeral-22.jpg"
              alt="Jardín iluminado al atardecer con árboles centenarios"
              fill
              quality={80}
              loading="lazy"
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/30" />
          <div className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 ml-auto max-w-3xl py-20 md:py-32 text-right">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/60 block mb-6 md:mb-8 font-medium">
              Capítulo II · Naturaleza
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.08em] md:tracking-[0.12em] uppercase font-extralight leading-[1.1] mb-8 md:mb-12 text-white">
              Armonía
              <br />
              Natural
            </h2>
            <p className="text-sm sm:text-sm md:text-lg font-light leading-relaxed mb-6 text-white/90">
              Donde los árboles centenarios adornan el paisaje con sus flores vibrantes y las aguas turquesa reflejan la
              paz del entorno.
            </p>
            <p className="text-sm sm:text-sm md:text-lg font-light leading-relaxed text-white/90">
              Un santuario natural que envuelve cada celebración en belleza serena.
            </p>
          </div>
        </section>

        {/* Capítulo IV Section */}
        <section id="capitulo-iv" className="relative min-h-screen w-full flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {/* Mejorando quality to 75 for balance performance/quality */}
            <Image
              src="/images/capitulo-iv.jpg"
              alt="Oasis turquesa El Romeral"
              fill
              quality={75}
              loading="lazy"
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA=="
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          <div className="relative z-10 text-center text-white px-6 md:px-8 max-w-4xl mx-auto">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase opacity-60 block mb-6 md:mb-8 font-medium">
              Capítulo IV · Oasis
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-[0.1em] md:tracking-[0.18em] uppercase font-extralight leading-[1.05] mb-8 md:mb-12">
              Oasis
              <br />
              Turquesa
            </h2>
            <p className="text-sm sm:text-sm md:text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto">
              Un paraíso acuático que invita a la contemplación. Aguas cristalinas rodeadas de vegetación exuberante
              crean un ambiente de tranquilidad absoluta, donde cada momento se convierte en un recuerdo imborrable.
            </p>
          </div>
        </section>

        {/* Gallery Section - Solo imágenes ya incluidas en el storytelling */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {[
            { img: "/images/img-0867.jpg", label: "Elegancia Jardín" },
            { img: "/images/er29nov25-21.jpg", label: "Elegancia Clásica" },
            { img: "/images/romeral4oct25-24.jpg", label: "Vanguardia Moderna" },
          ].map((item, i) => (
            <div
              key={i}
              className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[70vh] overflow-hidden group cursor-pointer"
            >
              <Image
                src={item.img || "/placeholder.svg"}
                alt={item.label}
                fill
                quality={75}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA=="
                className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <span className="text-xs sm:text-sm tracking-[0.2em] md:tracking-[0.25em] uppercase font-light group-hover:tracking-[0.3em] transition-all duration-500">
                    {item.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Blog Section */}
        <section className="py-20 md:py-32 lg:py-40 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-muted/5" id="guias">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary/60 block mb-6 md:mb-8 font-medium">
                Por Qué Los Detalles Hacen la Diferencia
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] md:tracking-[0.12em] uppercase font-extralight leading-[1.1] mb-8 md:mb-10 text-foreground">
                Guías
                <br />
                para Novios
              </h2>
              <p className="text-sm md:text-base tracking-[0.12em] font-light leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                Años de experiencia nos han enseñado que muchas decisiones pasan desapercibidas hasta el día del evento. Aquí compartimos lo que hemos aprendido para que ustedes puedan anticipar lo importante.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* Servicio y Atención */}
              <div className="border border-primary/10 p-8 hover:border-primary/30 transition-all duration-500 group">
                <h3 className="text-xs tracking-[0.25em] uppercase font-light mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                  Servicio y Atención
                </h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                  El personal capacitado marca la diferencia entre un evento que fluye y uno lleno de interrupciones. Entiendan por qué el ratio mesero-invitado y la coordinación profesional no son lujos, sino necesidades.
                </p>
              </div>

              {/* Alimentos */}
              <div className="border border-primary/10 p-8 hover:border-primary/30 transition-all duration-500 group">
                <h3 className="text-xs tracking-[0.25em] uppercase font-light mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                  Alimentos y Temperatura
                </h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                  La comida fría o mal presentada arruina cualquier celebración. Descubran por qué el montaje, los tiempos de servicio y la calidad de los ingredientes no son detalles, sino pilares de la experiencia.
                </p>
              </div>

              {/* Música */}
              <div className="border border-primary/10 p-8 hover:border-primary/30 transition-all duration-500 group">
                <h3 className="text-xs tracking-[0.25em] uppercase font-light mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                  Música y Ambiente
                </h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                  Un DJ que no lee a los invitados o un volumen inadecuado vacían la pista en minutos. Conozcan cómo la música profesional construye momentos memorables y mantiene la energía del evento.
                </p>
              </div>

              {/* Logística */}
              <div className="border border-primary/10 p-8 hover:border-primary/30 transition-all duration-500 group">
                <h3 className="text-xs tracking-[0.25em] uppercase font-light mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                  Logística y Estacionamiento
                </h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                  Los invitados que no encuentran dónde estacionar o que esperan bajo el sol empiezan su experiencia con frustración. Entiendan por qué el valet parking y la señalización clara no son opcionales.
                </p>
              </div>

              {/* Montaje */}
              <div className="border border-primary/10 p-8 hover:border-primary/30 transition-all duration-500 group">
                <h3 className="text-xs tracking-[0.25em] uppercase font-light mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                  Montaje y Espacios
                </h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                  Un jardín bien preparado desde el día anterior permite que todo comience sin prisas. Descubran por qué el pre-montaje, la iluminación adecuada y los espacios pensados transforman la experiencia.
                </p>
              </div>

              {/* Pronto */}
              <div className="border border-primary/10 p-8 bg-muted/10 flex items-center justify-center">
                <p className="text-xs tracking-[0.25em] uppercase font-light text-muted-foreground/60">
                  Próximamente
                  <br />
                  Más Guías
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs tracking-[0.2em] uppercase font-light text-muted-foreground/80 mb-8">
                Contenido educativo • Sin compromiso comercial
              </p>
              <Link
                href="/blog"
                className="inline-block border border-primary/20 px-10 md:px-12 py-3 md:py-4 text-xs tracking-[0.25em] uppercase font-light hover:bg-primary/5 hover:border-primary/40 transition-all duration-500"
              >
                Explorar Guías
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 md:py-32 lg:py-48 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-background">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase text-primary/60 block mb-12 md:mb-20 font-medium animate-fade-in">
              Visiten El Jardín
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 md:gap-x-20 gap-y-10 md:gap-y-16">
              <div>
                <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4 md:mb-6 font-light">
                  Ubicación
                </h3>
                <p className="text-base md:text-lg font-light leading-relaxed">
                  Prolongación Av. Vallarta no 2951
                  <br />
                  Col. El Romeral
                  <br />
                  Zapopan, Jalisco
                </p>
              </div>
              <div>
                <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4 md:mb-6 font-light">
                  Contacto
                </h3>
                <div className="space-y-2">
                  <a
                    href="mailto:contacto@elromeral.com.mx"
                    className="text-base md:text-lg font-light hover:text-primary transition-colors duration-500 block"
                  >
                    contacto@elromeral.com.mx
                  </a>
                  <a
                    href="http://wa.me/3338708159"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base md:text-lg font-light hover:text-primary transition-colors duration-500 block"
                  >
                    +52 33 3870 8159
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4 md:mb-6 font-light">
                  Horarios de Visita
                </h3>
                <p className="text-base md:text-lg font-light leading-relaxed">
                  Lunes - Viernes
                  <br />
                  9:00 - 17:00 hrs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 md:py-16 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 bg-muted/10 border-t border-primary/5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">
              © 2026 El Romeral · Todos los derechos reservados
            </p>

            <a
              href="https://netlab.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-30 hover:opacity-60 transition-opacity duration-500"
            >
              <Image
                src="/images/netlab-logo.png"
                alt="Desarrollado por NETLAB"
                width={80}
                height={25}
                className="object-contain"
                loading="lazy"
              />
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}
