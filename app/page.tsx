"use client"

import Link from "next/link"
import { useState, useEffect, useRef, lazy, Suspense } from "react"
import "@/styles/landing.css"

const WebChatBot = lazy(() => import("@/components/web-chat-bot"))

const WA_LINK =
  "https://wa.me/523336821088?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20El%20Romeral"

// ── FAQ data (también se usa para FAQPage JSON-LD) ───────────────────────────
const FAQ_ITEMS = [
  {
    q: "¿Qué hace especial a El Romeral como venue para bodas en Guadalajara?",
    a: "El Romeral es un venue de producción integral. A diferencia de salones convencionales donde se contrata el espacio y los servicios por separado, aquí un único equipo especializado coordina absolutamente todo: diseño de concepto, gastronomía de autor, decoración, iluminación y logística. Los novios solo llegan a vivir su día. Con más de 20 años de experiencia y más de 500 eventos realizados en la Zona Metropolitana de Guadalajara.",
  },
  {
    q: "¿Dónde está ubicado El Romeral?",
    a: "En Prolongación Av. Vallarta 2951, Colonia El Romeral, Zapopan, Jalisco, México. A aproximadamente 15 minutos del Centro de Guadalajara, con acceso fácil desde la carretera a Nogales y estacionamiento propio para todos los invitados.",
  },
  {
    q: "¿Qué tipos de eventos organiza El Romeral?",
    a: "Bodas (civiles, religiosas y mixtas), XV años y quinceañeras, bautizos, comuniones y primeras comuniones, eventos corporativos como galas, lanzamientos de producto y cenas de empresa, y eventos diurnos en jardín. La producción integral aplica a todos los tipos de celebración.",
  },
  {
    q: "¿El Romeral incluye servicio de gastronomía propio?",
    a: "Sí. Contamos con un equipo propio de gastronomía de autor. Ofrecemos menús diseñados a medida: desde tablas de quesos artesanales y bocadillos hasta banquetes de alta cocina, postres de autor con técnica de pastelería profesional y estaciones temáticas personalizadas para cada evento.",
  },
  {
    q: "¿Con cuánta anticipación debo reservar mi evento?",
    a: "Recomendamos iniciar el proceso con al menos 8 a 12 meses de anticipación, especialmente para fechas en temporada alta (marzo-mayo y octubre-diciembre). Para verificar disponibilidad y apartar tu fecha, escríbenos por WhatsApp al +52 33 3682 1088.",
  },
  {
    q: "¿El Romeral atiende a familias mexicanas que viven en Estados Unidos?",
    a: "Sí, con mucho gusto. Coordinamos todo el proceso de forma remota vía WhatsApp o videollamada. El proceso de reservación es completamente accesible desde el extranjero. Muchas familias mexicano-americanas eligen El Romeral para celebrar bodas, quinceañeras y bautizos en Guadalajara.",
  },
  {
    q: "¿Cómo puedo obtener una cotización?",
    a: "Puedes iniciar de tres formas: (1) nuestro cotizador interactivo en elromeral.com.mx/configurador, (2) WhatsApp al +52 33 3682 1088, o (3) email a contacto@elromeral.com.mx. Un asesor especializado diseña una propuesta personalizada sin compromiso.",
  },
]

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

// --- Nav ---
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handle, { passive: true })
    return () => window.removeEventListener("scroll", handle)
  }, [])

  const links = [
    { label: "Experiencia", href: "#experiencia" },
    { label: "Eventos",     href: "#eventos" },
    { label: "Gastronomía", href: "#gastronomia" },
    { label: "Proceso",     href: "#proceso" },
  ]

  return (
    <>
      <nav className={`lr-nav${scrolled ? " lr-scrolled" : ""}`}>
        <a href="#" className="lr-nav-logo">El <span>Romeral</span></a>
        <ul className="lr-nav-links">
          {links.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-nav-cta lr-desktop">
          Iniciar mi experiencia
        </a>
        <button className="lr-hamburger" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={scrolled ? "#1E2416" : "white"} strokeWidth="1.5">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>
      <div className={`lr-mobile-menu${mobileOpen ? " lr-open" : ""}`}>
        <button className="lr-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar">✕</button>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>
        ))}
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-btn-primary"
           onClick={() => setMobileOpen(false)} style={{ textAlign: "center", marginTop: 16 }}>
          Iniciar mi experiencia
        </a>
      </div>
    </>
  )
}

// --- FAQSection ---
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="lr-faq" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <div className="lr-faq-inner">
        <div className="lr-reveal" style={{ textAlign: "center" }}>
          <span className="lr-section-label">Resolvemos tus dudas</span>
          <h2 className="lr-section-title">Preguntas <em>frecuentes</em></h2>
        </div>
        <div className="lr-faq-list lr-reveal">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`lr-faq-item${openIdx === i ? " lr-open" : ""}`}>
              <button
                className="lr-faq-q"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span>{item.q}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="10" y1="4" x2="10" y2="16" className="lr-faq-vline" />
                  <line x1="4" y1="10" x2="16" y2="10" />
                </svg>
              </button>
              <div className="lr-faq-a" aria-hidden={openIdx !== i}>
                <div className="lr-faq-a-inner">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- FloatingWhatsApp ---
function FloatingWhatsApp() {
  const [open, setOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      {open && !chatOpen && (
        <>
          <div className="fixed inset-0 z-[68]" onClick={() => setOpen(false)} />
          <div className="fixed bottom-24 right-6 z-[69] flex flex-col gap-2"
               style={{ animation: "waPopup .22s cubic-bezier(.4,0,.2,1) forwards" }}>
            <button onClick={() => { setOpen(false); setChatOpen(true) }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-black/10 shadow-xl px-4 py-3 text-left hover:bg-amber-50 transition-colors duration-200"
              style={{ borderRadius: 12, minWidth: 220 }}>
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-sm">💬</span>
              <div>
                <div className="text-[11px] font-medium tracking-wide text-gray-800">Asesor aquí mismo</div>
                <div className="text-[10px] text-gray-500">Chat en el sitio</div>
              </div>
            </button>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
               className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-black/10 shadow-xl px-4 py-3 hover:bg-green-50 transition-colors duration-200"
               style={{ borderRadius: 12, minWidth: 220 }}>
              <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </span>
              <div>
                <div className="text-[11px] font-medium tracking-wide text-gray-800">Abrir WhatsApp</div>
                <div className="text-[10px] text-gray-500">Escríbenos directo</div>
              </div>
            </a>
          </div>
          <style>{"@keyframes waPopup{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}"}</style>
        </>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-label="Contactar a El Romeral"
              className="fixed bottom-8 right-6 z-[70] group flex items-center gap-3">
        {!open && (
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-[10px] tracking-[0.18em] uppercase font-light bg-white/90 backdrop-blur-sm border border-black/10 text-gray-700 px-3 py-1.5 shadow-lg whitespace-nowrap">
            Escríbenos
          </span>
        )}
        <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400/30 animate-ping opacity-60" />
          <div className="relative rounded-full bg-[#25D366] shadow-lg flex items-center justify-center transition-all duration-300"
               style={{ width: 52, height: 52, transform: open ? "rotate(45deg) scale(1.05)" : undefined }}>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            )}
          </div>
        </div>
      </button>
      {chatOpen && (
        <Suspense fallback={null}>
          <WebChatBot onClose={() => setChatOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

// --- Home ---
export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("lr-visible"); obs.unobserve(e.target) } }) },
      { threshold: 0.12 }
    )
    document.querySelectorAll(".lr-reveal").forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ background: "var(--lr-warm)", overflowX: "hidden" }}>
      <Nav />
      <FloatingWhatsApp />

      {/* HERO */}
      <section className="lr-hero">
        {!videoFailed && (
          <video ref={videoRef} className="lr-hero-video" autoPlay muted loop playsInline onError={() => setVideoFailed(true)}>
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}
        {videoFailed && <div className="lr-hero-fallback" />}
        <div className="lr-hero-overlay" />
        <div className="lr-hero-content">
          <p className="lr-hero-eyebrow">Guadalajara · Diseño de Experiencias Integrales</p>
          <h1 className="lr-hero-title">
            No organizamos<br /><em>eventos.</em><br />Creamos momentos<br />que perduran.
          </h1>
          <p className="lr-hero-sub">Un solo equipo. Cada detalle. Desde la primera idea hasta el último abrazo de la noche.</p>
          <div className="lr-hero-actions">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-btn-primary">Iniciar mi experiencia</a>
            <a href="#experiencia" className="lr-btn-ghost">Descubrir más</a>
          </div>
        </div>
        <div className="lr-scroll-hint"><span>Descubrir</span><div className="lr-scroll-line" /></div>
      </section>

      {/* STATEMENT */}
      <section className="lr-statement" id="experiencia">
        <div className="lr-reveal">
          <span className="lr-section-label">Nuestra filosofía</span>
          <h2 className="lr-section-title lr-statement-title">
            Tu tiempo vale más<br />que cualquier coordinación.<br /><em>Nosotros nos encargamos<br />de absolutamente todo.</em>
          </h2>
        </div>
        <div className="lr-statement-right lr-reveal">
          <p className="lr-body-text">
            El Romeral no es un salón de eventos. Somos un <strong>equipo de expertos con décadas de experiencia</strong> que diseña, produce y ejecuta experiencias integrales desde cero.<br /><br />
            Mientras tú y los tuyos viven cada momento, nosotros operamos con precisión detrás de escena. <strong>Antes, durante y después.</strong> Sin excepción.<br /><br />
            Nuestros clientes no contratan un espacio. <strong>Invierten en certeza, lujo y momentos que jamás olvidarán.</strong>
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-btn-primary">Conocer la experiencia</a>
        </div>
      </section>

      {/* VENUE FULL */}
      <div className="lr-venue-full lr-reveal">
        <div className="lr-venue-full-img" style={{ backgroundImage: "url('/images/redesign/venue-salon.jpg')" }} />
        <div className="lr-venue-full-label">El espacio que lo hace posible</div>
      </div>

      {/* MOSAIC */}
      <section className="lr-mosaic" id="eventos">
        <div className="lr-mosaic-header lr-reveal">
          <span className="lr-section-label">Nuestros eventos</span>
          <h2 className="lr-section-title">Cada celebración, <em>única</em></h2>
          <div className="lr-gold-divider"><div className="lr-gd-line"/><div className="lr-gd-diamond"/><div className="lr-gd-line"/></div>
        </div>
        <div className="lr-mosaic-grid lr-reveal">
          {[
            { img: "/images/redesign/boda-dia.jpg",             label: "Bodas",                 span: "lr-span2" },
            { img: "/images/redesign/xv-noche.jpg",             label: "XV Años" },
            { img: "/images/redesign/bautizo.jpg",              label: "Bautizos" },
            { img: "/images/redesign/xv-jardin.jpg",            label: "Producciones" },
            { img: "/images/redesign/evento-pantalla.jpg",      label: "Eventos Corporativos",   span: "lr-span3" },
            { img: "/images/redesign/evento-mesa-imperial.jpg", label: "Diseño de mesas" },
            { img: "/images/redesign/detalle-camaras.jpg",      label: "Detalles únicos" },
          ].map((item, i) => (
            <div key={i} className={`lr-mi${item.span ? " " + item.span : ""}`}>
              <div className="lr-mi-inner" style={{ backgroundImage: `url('${item.img}')` }} />
              <div className="lr-mi-ov"><span className="lr-mi-label">{item.label}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* GASTRONOMY */}
      <section className="lr-gastro" id="gastronomia">
        <div className="lr-gastro-inner">
          <div className="lr-reveal" style={{ textAlign: "center" }}>
            <span className="lr-section-label">Gastronomía de autor</span>
            <h2 className="lr-section-title">Cada sabor, <em>una experiencia</em></h2>
          </div>
          <div className="lr-gastro-grid lr-reveal">
            {[
              "/images/redesign/gastronomia-quesos.jpg",
              "/images/redesign/gastronomia-postre-manzana.jpg",
              "/images/redesign/gastronomia-postre-pera.jpg",
              "/images/redesign/detalle-algodon.jpg",
            ].map((src, i) => (
              <div key={i} className="lr-gf"><div className="lr-gf-img" style={{ backgroundImage: `url('${src}')` }} /></div>
            ))}
          </div>
          <div className="lr-gastro-caption lr-reveal">
            <div>
              <h3 className="lr-gastro-title">Menús diseñados<br />para <em>sorprender</em></h3>
              <p className="lr-gastro-desc">Desde tablas de quesos artesanales hasta postres de autor con técnica de alta cocina. Cada bocado es parte de la narrativa de tu evento, curado por nuestro equipo gastronómico con la misma atención al detalle que el resto de la producción.</p>
            </div>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-btn-primary" style={{ flexShrink: 0 }}>Conocer nuestra propuesta</a>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="lr-pillars">
        <div className="lr-pillars-inner">
          <div className="lr-reveal" style={{ textAlign: "center" }}>
            <span className="lr-section-label">Lo que nos distingue</span>
            <h2 className="lr-section-title">Tres pilares de <em>excelencia</em></h2>
          </div>
          <div className="lr-pillars-grid">
            {[
              { num: "01", title: "Experiencia Integral", desc: "Desde la primera reunión de visión hasta el último detalle del cierre. Un equipo dedicado que resuelve, anticipa y sorprende. Tú solo decides; nosotros ejecutamos con maestría." },
              { num: "02", title: "Producción Premium",   desc: "Espacios, iluminación, gastronomía, florería, entretenimiento y logística de clase mundial. Cada elemento curado para crear una experiencia visual y sensorial sin igual.", delay: ".12s" },
              { num: "03", title: "Tranquilidad Total",   desc: "Nuestros clientes llegan a disfrutar, no a supervisar. Sin estrés, sin sorpresas. Exactamente como lo imaginaste — o mejor. Esa es nuestra promesa.", delay: ".24s" },
            ].map((p, i) => (
              <div key={i} className="lr-pillar lr-reveal" style={{ transitionDelay: (p as {num:string;title:string;desc:string;delay?:string}).delay }}>
                <div className="lr-pillar-num">{p.num}</div>
                <h3 className="lr-pillar-title">{p.title}</h3>
                <p className="lr-pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="lr-experience">
        <div className="lr-exp-photos lr-reveal">
          <div className="lr-exp-photo-1" style={{ backgroundImage: "url('/images/redesign/venue-sendero.jpg')" }} />
          <div className="lr-exp-photo-2" style={{ backgroundImage: "url('/images/redesign/detalle-menu.jpg')" }} />
          <div className="lr-exp-badge">Todo en un solo equipo</div>
        </div>
        <div className="lr-reveal">
          <span className="lr-section-label">Nuestro alcance</span>
          <h2 className="lr-section-title" style={{ marginBottom: 32 }}>Cada <em>detalle</em>, cubierto</h2>
          <ul className="lr-exp-list">
            {[
              { title: "Diseño y Concepto",      desc: "Tu visión convertida en un concepto completo. Paleta, estilo, narrativa y atmósfera diseñados a medida." },
              { title: "Producción y Logística", desc: "Proveedores, montaje, tiempos y recursos con precisión. Cero imprevistos. Todo en el lugar exacto, en el momento exacto." },
              { title: "Gastronomía de Autor",    desc: "Menús diseñados para sorprender. Desde bocadillos hasta el banquete, cada sabor es parte de la experiencia." },
              { title: "Seguimiento Post-Evento", desc: "Nuestra relación no termina con el último invitado. Cada promesa se cumple hasta el cierre total." },
            ].map((item, i) => (
              <li key={i}>
                <div className="lr-exp-bullet" />
                <div><div className="lr-exp-item-title">{item.title}</div><div className="lr-exp-item-desc">{item.desc}</div></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STATS */}
      <section className="lr-stats">
        <div className="lr-stats-grid">
          {[
            { num: "20+",  label: "Años de\nexperiencia" },
            { num: "500+", label: "Eventos\nrealizados" },
            { num: "98%",  label: "Clientes\nsatisfechos" },
            { num: "∞",    label: "Posibilidades\ncreativas" },
          ].map((s, i) => (
            <div key={i} className="lr-stat lr-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="lr-stat-num">{s.num}</div>
              <div className="lr-stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* JOY */}
      <section className="lr-joy">
        <div className="lr-joy-grid lr-reveal">
          {[
            { src: "/images/redesign/momentos-ninos.jpg",   pos: "center" },
            { src: "/images/redesign/venue-lago-fuego.jpg", pos: "center 30%" },
            { src: "/images/redesign/momentos-alegria.jpg", pos: "center top" },
          ].map((img, i) => (
            <div key={i} className="lr-joy-img" style={{ backgroundImage: `url('${img.src}')`, backgroundPosition: img.pos }} />
          ))}
        </div>
        <div className="lr-joy-caption lr-reveal">
          <div className="lr-joy-quote">&ldquo;El mejor evento <span>no se planea,</span> se vive.&rdquo;</div>
          <p className="lr-joy-body">Eso es lo que hacemos posible. Mientras nuestro equipo cuida cada detalle detrás de escena, tus invitados — grandes y pequeños — crean los recuerdos que contarán por años. La alegría genuina que ves en cada fotografía es nuestra mejor carta de presentación.</p>
        </div>
      </section>

      {/* PROCESS */}
      <section className="lr-process" id="proceso">
        <div className="lr-reveal" style={{ textAlign: "center" }}>
          <span className="lr-section-label">Nuestro proceso</span>
          <h2 className="lr-section-title">Así funciona <em>nuestra magia</em></h2>
        </div>
        <div className="lr-process-steps">
          <div className="lr-process-line" />
          {[
            { rom: "I",   title: "Visión",      desc: "Escuchamos tu historia y tus deseos. La primera cita es donde todo nace." },
            { rom: "II",  title: "Diseño",      desc: "Creamos la propuesta completa: concepto, espacios y presupuesto a medida.",              delay: ".12s" },
            { rom: "III", title: "Producción",  desc: "Ejecutamos cada detalle. Tú olvídate de coordinar; nosotros nos encargamos de todo.",     delay: ".24s" },
            { rom: "IV",  title: "Tu Momento",  desc: "El día llega perfecto. Solo vives, disfrutas y creas recuerdos que duran toda la vida.", delay: ".36s" },
          ].map((step, i) => (
            <div key={i} className="lr-step lr-reveal" style={{ transitionDelay: (step as { rom: string; title: string; desc: string; delay?: string }).delay }}>
              <div className="lr-step-dot">{step.rom}</div>
              <div className="lr-step-title">{step.title}</div>
              <div className="lr-step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* FINAL CTA */}
      <section className="lr-final-cta lr-reveal">
        <h2 className="lr-final-cta-title">Tu celebración perfecta<br /><em>comienza aquí.</em></h2>
        <p className="lr-final-cta-sub">Un asesor especializado te guía desde la primera idea hasta el último detalle.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="lr-btn-primary">Iniciar mi experiencia →</a>
      </section>

      {/* CONTACT */}
      <section className="lr-contact">
        <div className="lr-contact-inner">
          <div className="lr-reveal">
            <span className="lr-section-label">Visítanos</span>
            <h2 className="lr-section-title">Estamos en <em>Zapopan</em></h2>
          </div>
          <div className="lr-contact-grid">
            <div className="lr-reveal">
              <div className="lr-contact-label">Ubicación</div>
              <div className="lr-contact-value">Prolongación Av. Vallarta 2951<br />Col. El Romeral<br />Zapopan, Jalisco</div>
            </div>
            <div className="lr-reveal">
              <div className="lr-contact-label">Contacto</div>
              <div className="lr-contact-value">
                <a href="mailto:contacto@elromeral.com.mx">contacto@elromeral.com.mx</a><br />
                <a href="https://wa.me/523336821088" target="_blank" rel="noopener noreferrer">+52 33 3682 1088</a>
              </div>
            </div>
            <div className="lr-reveal">
              <div className="lr-contact-label">Horarios de visita</div>
              <div className="lr-contact-value">Lunes – Viernes<br />9:00 – 17:00 hrs</div>
            </div>
          </div>
          <div className="lr-reveal" style={{ marginTop: 64, display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { href: "/galeria",      label: "Ver galería" },
              { href: "/blog",         label: "Guías para novios" },
              { href: "/planners",     label: "Planners" },
              { href: "/configurador", label: "Cotizador de bodas" },
            ].map((lnk) => (
              <Link key={lnk.href} href={lnk.href} style={{ fontFamily: "var(--lr-fb)", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--lr-txt-m)", textDecoration: "none", borderBottom: "1px solid var(--lr-gold-xl)", paddingBottom: 4 }}>{lnk.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lr-footer">
        <p className="lr-footer-copy">© 2026 El Romeral · Todos los derechos reservados</p>
        <div className="lr-footer-links">
          <Link href="/politica-de-privacidad">Privacidad</Link>
          <Link href="/condiciones-de-servicio">Condiciones</Link>
          <a href="https://netlab.mx" target="_blank" rel="noopener noreferrer">NETLAB</a>
        </div>
      </footer>
    </div>
  )
}