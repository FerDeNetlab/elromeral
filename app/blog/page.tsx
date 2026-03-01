"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X, ArrowRight } from "lucide-react"
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

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

        <div className="flex flex-col gap-8 text-xs tracking-[0.25em] uppercase font-light">
          <Link href="/" className="hover:text-primary transition-colors duration-500">
            Inicio
          </Link>
          <Link href="/configurador" className="hover:text-primary transition-colors duration-500">
            Configurador
          </Link>
          <Link href="/blog" className="text-primary">
            Blog
          </Link>
        </div>

        <div className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">El Romeral</div>
      </nav>
    </>
  )
}

export default function BlogPage() {
  const categorias = [
    {
      id: "servicio-atencion",
      titulo: "Servicio y Atención",
      descripcion:
        "Por qué el número de meseros y la calidad del servicio impactan directamente la experiencia del invitado. Qué pasa cuando esto no se planea bien.",
      color: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-900",
    },
    {
      id: "experiencia-gastronomica",
      titulo: "Experiencia Gastronómica",
      descripcion:
        "Temperatura de los alimentos, tiempos de servicio y flujo entre momentos del evento. Los detalles que marcan la diferencia en la mesa.",
      color: "from-amber-50 to-orange-50",
      textColor: "text-amber-900",
    },
    {
      id: "musica-ambiente",
      titulo: "Música y Ambiente",
      descripcion:
        "Por qué la música es clave para que una boda funcione. La diferencia entre 'poner música' y leer el evento.",
      color: "from-violet-50 to-purple-50",
      textColor: "text-violet-900",
    },
    {
      id: "logistica-estacionamiento",
      titulo: "Logística y Estacionamiento",
      descripcion:
        "Cómo la llegada y salida de los invitados afecta la experiencia. Por qué contar con estacionamiento suficiente cambia todo.",
      color: "from-blue-50 to-cyan-50",
      textColor: "text-blue-900",
    },
    {
      id: "montaje-desmontaje",
      titulo: "Montaje y Desmontaje",
      descripcion:
        "Qué es el pre y post montaje, por qué casi nadie lo explica y cómo una mala planeación afecta a novios e invitados.",
      color: "from-rose-50 to-pink-50",
      textColor: "text-rose-900",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileNav />

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-24 z-50 flex-col items-center justify-between py-12 border-r border-primary/10 bg-background/95 backdrop-blur-sm">
        <Link href="/" className="hover:opacity-70 transition-opacity duration-500">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={48}
            height={48}
            className="object-contain"
          />
        </Link>

        <div className="flex flex-col gap-12 text-[9px] tracking-[0.25em] uppercase font-light [writing-mode:vertical-lr] rotate-180">
          <Link href="/" className="hover:text-primary transition-colors duration-500">
            Inicio
          </Link>
          <Link href="/configurador" className="hover:text-primary transition-colors duration-500">
            Configurador
          </Link>
          <Link href="/blog" className="text-primary">
            Blog
          </Link>
        </div>

        <div className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground [writing-mode:vertical-lr] rotate-180">
          El Romeral
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-24">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex items-center justify-center px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[9px] tracking-[0.35em] uppercase text-primary/60 block mb-8 font-light">
              Entender para Decidir Mejor
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] md:tracking-[0.12em] uppercase font-extralight leading-[1.1] mb-8 text-foreground">
              Blog
              <br />
              Educativo
              <br />
              Para Novios
            </h1>

            <div className="max-w-2xl mx-auto space-y-6 text-sm md:text-base font-light leading-relaxed text-muted-foreground">
              <p className="tracking-[0.08em]">
                La mayoría de las personas no sabe cuánto cuesta casarse ni todo lo que realmente implica organizar un evento. En El Romeral creemos que cuando entiendes los detalles, tomas mejores decisiones y disfrutas mucho más tu boda.
              </p>
              
              <p className="tracking-[0.08em]">
                Este espacio existe para ayudarte a anticipar situaciones que normalmente no se consideran, entender por qué ciertos detalles hacen la diferencia y reconocer el valor de una experiencia integral bien pensada.
              </p>
              
              <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground/70 pt-4">
                No vendemos, acompañamos.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Categories Section */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light text-center mb-4">
              Explora Por Categoría
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70 text-center mb-16">
              Cada tema aborda un aspecto clave de tu experiencia
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categorias.map((categoria) => (
                <article
                  key={categoria.id}
                  className="group cursor-pointer border border-primary/10 hover:border-primary/30 transition-all duration-500 overflow-hidden bg-background hover:shadow-xl"
                >
                  <div className={`h-2 bg-gradient-to-r ${categoria.color} group-hover:h-3 transition-all duration-500`} />
                  
                  <div className="p-8">
                    <h3 className={`text-xl tracking-[0.08em] uppercase font-light mb-4 ${categoria.textColor} group-hover:text-primary transition-colors duration-500`}>
                      {categoria.titulo}
                    </h3>
                    
                    <p className="text-sm font-light leading-relaxed text-muted-foreground mb-6">
                      {categoria.descripcion}
                    </p>

                    <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary/60 group-hover:text-primary transition-colors duration-500">
                      <span>Próximamente</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-500" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Coming Soon Section */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-6">
              Contenido en Desarrollo
            </h2>
            
            <p className="text-sm md:text-base font-light leading-relaxed text-muted-foreground mb-8 tracking-[0.08em]">
              Estamos preparando artículos detallados para cada categoría. Cada uno explicará por qué estos detalles importan, qué problemas comunes evitan y cómo El Romeral ya tiene resueltas muchas decisiones clave que otros lugares dejan al azar.
            </p>

            <div className="inline-block border border-primary/20 px-8 py-3 text-xs tracking-[0.25em] uppercase font-light text-muted-foreground">
              Mantente Atento
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-6">
              ¿Lista Para Diseñar Tu Experiencia?
            </h2>
            
            <p className="text-sm md:text-base font-light leading-relaxed text-muted-foreground mb-10 tracking-[0.08em]">
              Ahora que entiendes mejor cómo funcionan los detalles, explora nuestro configurador para ver cómo cada decisión forma parte de una experiencia completa.
            </p>

            <Link
              href="/configurador"
              className="inline-block border border-primary/20 px-10 py-4 text-xs tracking-[0.25em] uppercase font-light hover:bg-primary/5 hover:border-primary/40 transition-all duration-500"
            >
              Personaliza y cotiza tu boda
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-primary/10">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60">
              El Romeral © 2026 • Jardín para Bodas en Guadalajara
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
