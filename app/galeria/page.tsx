import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const galeria = [
  {
    src: "/images/romeral12.jpg",
    alt: "Lago turquesa con cisnes negros",
    titulo: "CISNES AL ATARDECER",
    descripcion: "Donde la naturaleza danza en aguas cristalinas",
  },
  {
    src: "/images/portada-capilla-1.jpg",
    alt: "Capilla consagrada de El Romeral",
    titulo: "DONDE EL AMOR SE CONSAGRA",
    descripcion: "Nuestra capilla con validez, el escenario perfecto para jurarse amor eterno",
  },
  {
    src: "/images/er29nov25-21.jpg",
    alt: "Toldo iluminado",
    titulo: "CIELOS DE ENSUEÑO",
    descripcion: "Arquitectura que abraza cada celebración",
  },
  {
    src: "/images/elromeral-1-282-29.jpg",
    alt: "Fuente central con árbol majestuoso",
    titulo: "AGUA VIVA",
    descripcion: "Fuentes danzantes que dan vida al jardín bajo la sombra de árboles centenarios",
  },
  {
    src: "/images/zabdi-20acal-3.jpg",
    alt: "Alberca turquesa vista aérea",
    titulo: "OASIS CRISTALINO",
    descripcion: "Aguas que reflejan momentos eternos",
  },
  {
    src: "/images/mesa-rey-arturo.jpg",
    alt: "Árbol floral nocturno",
    titulo: "EL ÁRBOL DE LOS SUEÑOS",
    descripcion: "Donde la fantasía cobra vida",
  },
  {
    src: "/images/img-0940.jpg",
    alt: "Mesa de degustación gourmet",
    titulo: "EXPERIENCIA CULINARIA",
    descripcion: "Sabores que despiertan los sentidos",
  },
  {
    src: "/images/rango-1.jpg",
    alt: "Mesa elegante vista cenital",
    titulo: "DETALLES QUE ENAMORAN",
    descripcion: "Cada elemento en perfecta armonía",
  },
  {
    src: "/images/20250809-el-romeral-0980.jpg",
    alt: "Cocina profesional",
    titulo: "EXCELENCIA GASTRONÓMICA",
    descripcion: "Donde nace la magia de cada platillo",
  },
  {
    src: "/images/romeral4oct25-44.jpg",
    alt: "Vista crepuscular del venue",
    titulo: "ATARDECER EN EL ROMERAL",
    descripcion: "Cuando el cielo pinta su mejor obra",
  },
  {
    src: "/images/zabdi-acal-83.jpg",
    alt: "Platillo gourmet",
    titulo: "ARTE EN CADA PLATO",
    descripcion: "Gastronomía que conquista el paladar",
  },
  {
    src: "/images/elromeral-1.jpg",
    alt: "Recepción nocturna con candelabros de cristal",
    titulo: "NOCHE DE ENSUEÑO",
    descripcion: "Candelabros de cristal y flores que iluminan la celebración perfecta",
  },
]

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header minimalista */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-background/95 backdrop-blur-sm">
        <Link href="/" className="hover:opacity-70 transition-opacity duration-500">
          <Image
            src="/images/el-romeral-logo-nuevo.png"
            alt="El Romeral"
            width={70}
            height={35}
            quality={90}
            className="object-contain"
          />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-light hover:opacity-60 transition-opacity duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          REGRESAR
        </Link>
      </header>

      {/* Galería inmersiva - Grid 2x2 */}
      <main className="pt-24 md:pt-28">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {galeria.map((item, index) => (
            <div key={index} className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden group">
              <Image
                src={item.src || "/placeholder.svg"}
                alt={item.alt}
                fill
                quality={80}
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index < 4}
                loading={index < 6 ? "eager" : "lazy"}
              />
              {/* Overlay gradient siempre visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Texto siempre visible */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-light tracking-[0.15em] mb-2">
                  {item.titulo}
                </h3>
                <p className="text-white/70 text-xs md:text-sm font-light tracking-wide">{item.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CTA Final elegante */}
      <section className="py-24 md:py-32 px-6 md:px-12 text-center bg-background">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8 font-light">El Romeral</p>
        <h2 className="text-2xl md:text-4xl lg:text-5xl tracking-[0.12em] uppercase font-extralight mb-8">
          Vivan la Experiencia
        </h2>
        <p className="text-sm md:text-base font-light text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed">
          Cada imagen es solo un vistazo. Los invitamos a descubrir El Romeral en persona y crear juntos su historia
          perfecta.
        </p>
        <Link
          href="/configurador"
          className="inline-block text-[11px] tracking-[0.25em] uppercase font-light border border-foreground/20 px-12 py-5 hover:bg-foreground hover:text-background transition-all duration-500"
        >
          Personaliza y cotiza tu boda
        </Link>
      </section>

      {/* Footer mínimo */}
      <footer className="py-8 px-6 border-t border-foreground/5 text-center">
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 font-light uppercase">
          © 2026 El Romeral · Zapopan, Jalisco
        </p>
      </footer>
    </div>
  )
}
