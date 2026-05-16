"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number
  html: string
  type: "bot" | "user"
  time: string
}

interface Option {
  label: string
  fn: () => void
}

interface Card {
  label: string
  photo?: string
  photo2?: string
  bg?: string
  wide?: boolean
  fn: () => void
}

type InputMode = "none" | "options" | "cards" | "budgets" | "text"

interface BotData {
  name?: string
  eventType?: string
  hasDate?: boolean
  date?: string
  guests?: string
  budget?: string
  schedule?: string
  phone?: string
  apptDate?: string
  apptTime?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BUDGETS: Record<string, string[]> = {
  "50–100":  ["Menos de $280,000 MXN", "$280,000 – $450,000 MXN", "Más de $450,000 MXN"],
  "101–150": ["Menos de $370,000 MXN", "$370,000 – $650,000 MXN", "Más de $650,000 MXN"],
  "151–200": ["Menos de $460,000 MXN", "$460,000 – $750,000 MXN", "Más de $750,000 MXN"],
  "201–250": ["Menos de $550,000 MXN", "$550,000 – $800,000 MXN", "Más de $800,000 MXN"],
  "251–300": ["Menos de $700,000 MXN", "$700,000 – $900,000 MXN", "Más de $900,000 MXN"],
  "301–350": ["Menos de $850,000 MXN", "Más de $850,000 MXN"],
}

const GUEST_MSG: Record<string, string> = {
  "50–100":  "🤍 Una celebración íntima y elegante, donde cada detalle se siente personal.",
  "101–150": "✨ El equilibrio perfecto entre cercanía y gran ambiente.",
  "151–200": "🎉 Una celebración vibrante llena de posibilidades.",
  "201–250": "💫 Un evento memorable para compartir en grande.",
  "251–300": "🤍 Una celebración donde nadie importante se queda fuera.",
  "301–350": "✨ Un gran momento para reunir a todos y vivirlo por todo lo alto.",
}

const WA_NUMBER = "523336821088"
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const nowStr = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
const hasYear = (s: string) => /\b(202[5-9]|203[0-2])\b/.test(s)

// ─── Component ────────────────────────────────────────────────────────────────
export default function WebChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>("none")
  const [options, setOptions] = useState<Option[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [budgets, setBudgets] = useState<string[]>([])
  const [textPlaceholder, setTextPlaceholder] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  const dataRef = useRef<BotData>({})
  const textCallbackRef = useRef<((val: string) => void) | null>(null)
  const msgsEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Focus input when text mode
  useEffect(() => {
    if (inputMode === "text") inputRef.current?.focus()
  }, [inputMode])

  // ─── Core helpers ──────────────────────────────────────────────────────────
  const addMsg = useCallback((html: string, type: "bot" | "user" = "bot") => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), html, type, time: nowStr() },
    ])
  }, [])

  const typing = useCallback(async (ms = 1000) => {
    setIsTyping(true)
    await sleep(ms)
    setIsTyping(false)
  }, [])

  const clearBottom = useCallback(() => {
    setInputMode("none")
    setOptions([])
    setCards([])
    setBudgets([])
    setTextPlaceholder("")
    textCallbackRef.current = null
  }, [])

  const showOpts = useCallback((list: Option[]) => {
    setOptions(list)
    setInputMode("options")
  }, [])

  const showCards = useCallback((list: Card[]) => {
    setCards(list)
    setInputMode("cards")
  }, [])

  const showBudgets = useCallback((list: string[]) => {
    setBudgets(list)
    setInputMode("budgets")
  }, [])

  const showInput = useCallback((placeholder: string, cb: (val: string) => void) => {
    setTextPlaceholder(placeholder)
    textCallbackRef.current = cb
    setInputMode("text")
    setInputValue("")
  }, [])

  const handleOptionClick = useCallback((opt: Option) => {
    clearBottom()
    addMsg(opt.label, "user")
    setTimeout(opt.fn, 380)
  }, [clearBottom, addMsg])

  const handleCardClick = useCallback((card: Card) => {
    clearBottom()
    addMsg(card.label, "user")
    setTimeout(card.fn, 380)
  }, [clearBottom, addMsg])

  const handleBudgetClick = useCallback((label: string, fn: () => void) => {
    clearBottom()
    addMsg(label, "user")
    setTimeout(fn, 380)
  }, [clearBottom, addMsg])

  const handleTextSend = useCallback(() => {
    const val = inputValue.trim()
    if (!val || !textCallbackRef.current) return
    const cb = textCallbackRef.current
    clearBottom()
    addMsg(val, "user")
    setInputValue("")
    setTimeout(() => cb(val), 380)
  }, [inputValue, clearBottom, addMsg])

  // ─── Finalize: save to API ─────────────────────────────────────────────────
  const finalize = useCallback(async () => {
    const d = dataRef.current
    if (!d.phone) return
    setDone(true)
    try {
      await fetch("/api/webchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          eventType: d.eventType,
          hasDate: d.hasDate ?? false,
          date: d.date,
          guests: d.guests,
          budget: d.budget,
          phone: d.phone,
          schedule: d.schedule,
          apptDate: d.apptDate,
          apptTime: d.apptTime,
        }),
      })
    } catch {
      // non-critical
    }
  }, [])

  // ─── Flow steps ───────────────────────────────────────────────────────────
  const step_schedule = useCallback(async () => {
    setProgress(84)
    await typing(600)
    addMsg("¿Cómo prefieres agendar tu cita?")
    showOpts([
      {
        label: "📞 Que una asesora me contacte",
        fn: async () => {
          setProgress(100)
          await typing(700)
          addMsg(`Perfecto, ${dataRef.current.name} ✨ Una asesora de El Romeral se pondrá en contacto contigo a la brevedad.`)
          await typing(500)
          addMsg("¿Cuál es tu WhatsApp para coordinar?")
          showInput("Tu WhatsApp…", async (phone) => {
            dataRef.current.phone = phone
            await typing(900)
            addMsg(`¡Todo listo, ${dataRef.current.name}! 🎉 Nuestro equipo te contactará muy pronto. Estamos emocionados de crear algo extraordinario. 🤍`)
            finalize()
          })
        },
      },
      {
        label: "📅 Agendar directamente aquí",
        fn: async () => {
          await typing(600)
          addMsg(`¡Perfecto, ${dataRef.current.name}! 🤍 ¿Qué fecha te acomoda para tu cita con nosotros?`)
          showInput("Ej: lunes 20 de enero de 2026…", async (apptDate) => {
            dataRef.current.apptDate = apptDate
            await typing(600)
            addMsg("¿Y qué horario te viene mejor?")
            showOpts([
              {
                label: "☀️ Mañana (9:00 – 13:00)",
                fn: async () => {
                  dataRef.current.apptTime = "Mañana, 9:00–13:00"
                  setProgress(100)
                  await typing(700)
                  addMsg(`¡Confirmado, ${dataRef.current.name}! ✨`)
                  await typing(500)
                  addMsg(`Tu cita queda agendada el <strong>${dataRef.current.apptDate}</strong> en horario <strong>Mañana, 9:00–13:00</strong>. Recibirás confirmación en breve. 🤍`)
                  await typing(500)
                  addMsg("¿Cuál es tu WhatsApp para confirmar?")
                  showInput("Tu WhatsApp…", async (phone) => {
                    dataRef.current.phone = phone
                    addMsg(`¡Perfecto! Estamos muy emocionados de comenzar a diseñar tu experiencia. ¡Hasta pronto! 🌟`)
                    finalize()
                  })
                },
              },
              {
                label: "🌤️ Tarde (14:00 – 18:00)",
                fn: async () => {
                  dataRef.current.apptTime = "Tarde, 14:00–18:00"
                  setProgress(100)
                  await typing(700)
                  addMsg(`¡Confirmado, ${dataRef.current.name}! ✨`)
                  await typing(500)
                  addMsg(`Tu cita queda agendada el <strong>${dataRef.current.apptDate}</strong> en horario <strong>Tarde, 14:00–18:00</strong>. Recibirás confirmación en breve. 🤍`)
                  await typing(500)
                  addMsg("¿Cuál es tu WhatsApp para confirmar?")
                  showInput("Tu WhatsApp…", async (phone) => {
                    dataRef.current.phone = phone
                    addMsg(`¡Perfecto! Estamos muy emocionados de comenzar a diseñar tu experiencia. ¡Hasta pronto! 🌟`)
                    finalize()
                  })
                },
              },
              {
                label: "🌙 Noche (18:00 – 20:00)",
                fn: async () => {
                  dataRef.current.apptTime = "Noche, 18:00–20:00"
                  setProgress(100)
                  await typing(700)
                  addMsg(`¡Confirmado, ${dataRef.current.name}! ✨`)
                  await typing(500)
                  addMsg(`Tu cita queda agendada el <strong>${dataRef.current.apptDate}</strong> en horario <strong>Noche, 18:00–20:00</strong>. Recibirás confirmación en breve. 🤍`)
                  await typing(500)
                  addMsg("¿Cuál es tu WhatsApp para confirmar?")
                  showInput("Tu WhatsApp…", async (phone) => {
                    dataRef.current.phone = phone
                    addMsg(`¡Perfecto! Estamos muy emocionados de comenzar a diseñar tu experiencia. ¡Hasta pronto! 🌟`)
                    finalize()
                  })
                },
              },
            ])
          })
        },
      },
    ])
  }, [typing, addMsg, showOpts, showInput, finalize, setProgress])

  const step_budget = useCallback(async (excludeLow = false) => {
    await typing(750)
    const d = dataRef.current
    const intro = excludeLow
      ? `A veces con la visión correcta se descubren posibilidades increíbles, ${d.name} 💫 ¿Cuál de estas opciones se acerca mejor a tu inversión estimada?`
      : `Para orientarte correctamente, ${d.name}: ¿cuál es el rango de inversión estimado para la experiencia completa?`
    addMsg(intro)
    let ranges = BUDGETS[d.guests ?? "151–200"] ?? []
    if (excludeLow) ranges = ranges.filter((r) => !r.startsWith("Menos de"))

    showBudgets(ranges)
    // budget click is handled inline via handleBudgetWithFn
    // We store the budget options list and handle fn via budgetClickHandler below
  }, [typing, addMsg, showBudgets])

  // We need the budget click handler to know excludeLow context — use a ref
  const budgetExcludeLowRef = useRef(false)

  const handleBudgetSelect = useCallback(async (label: string) => {
    dataRef.current.budget = label
    setProgress(70)
    const isLow = label.startsWith("Menos de")

    if (isLow) {
      await typing(1000)
      addMsg(`Gracias por compartirlo, ${dataRef.current.name} 🤍`)
      await typing(700)
      addMsg("Por el nivel de personalización y acompañamiento integral que ofrecemos, normalmente trabajamos en rangos de inversión distintos.")
      await typing(600)
      addMsg("✨ Sin embargo, si deseas explorar una experiencia más amplia, con gusto te mostramos más opciones. ¿Te gustaría reconsiderar?")
      showOpts([
        {
          label: "💫 Sí, quiero ver más opciones",
          fn: () => {
            budgetExcludeLowRef.current = true
            step_budget(true)
          },
        },
        {
          label: "🚫 No por ahora",
          fn: async () => {
            setProgress(100)
            await typing(700)
            addMsg(`Gracias por pensar en El Romeral, ${dataRef.current.name}. 🤍`)
            addMsg("Si en el futuro desean explorar una celebración más personalizada, estaremos felices de acompañarlos. ¡Hasta pronto!")
            // Save partial lead (no phone yet — won't call finalize properly; just show WhatsApp)
            await typing(600)
            addMsg(`Puedes escribirnos cuando quieras por WhatsApp: <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener noreferrer" style="color:#B8935A;text-decoration:underline">wa.me/3336821088</a>`)
          },
        },
      ])
    } else {
      await typing(900)
      addMsg(`✨ ${dataRef.current.name}, con lo que nos compartes creemos que podemos construir algo muy especial para ti.`)
      await typing(650)
      addMsg("El siguiente paso ideal es una cita personalizada para conocer tu visión y comenzar a diseñar algo extraordinario. 🤍")
      step_schedule()
    }
  }, [typing, addMsg, showOpts, step_budget, step_schedule, setProgress])

  const step_guests = useCallback(async () => {
    await typing(700)
    addMsg("¿Aproximadamente cuántos invitados contemplan?")
    showOpts([
      { label: "50 – 100 invitados",  fn: async () => { dataRef.current.guests = "50–100";  setProgress(54); await typing(700); addMsg(GUEST_MSG["50–100"]);  handleBudgetSelect === handleBudgetSelect && step_budget() } },
      { label: "101 – 150 invitados", fn: async () => { dataRef.current.guests = "101–150"; setProgress(54); await typing(700); addMsg(GUEST_MSG["101–150"]); step_budget() } },
      { label: "151 – 200 invitados", fn: async () => { dataRef.current.guests = "151–200"; setProgress(54); await typing(700); addMsg(GUEST_MSG["151–200"]); step_budget() } },
      { label: "201 – 250 invitados", fn: async () => { dataRef.current.guests = "201–250"; setProgress(54); await typing(700); addMsg(GUEST_MSG["201–250"]); step_budget() } },
      { label: "251 – 300 invitados", fn: async () => { dataRef.current.guests = "251–300"; setProgress(54); await typing(700); addMsg(GUEST_MSG["251–300"]); step_budget() } },
      { label: "301 – 350 invitados", fn: async () => { dataRef.current.guests = "301–350"; setProgress(54); await typing(700); addMsg(GUEST_MSG["301–350"]); step_budget() } },
    ])
  }, [typing, addMsg, showOpts, step_budget, setProgress])

  const step_type = useCallback(async (type: string) => {
    dataRef.current.eventType = type
    setProgress(24)

    if (type === "corporativo" || type === "social") {
      await typing(900)
      addMsg(`¡Gracias, ${dataRef.current.name}! ✨`)
      await typing(600)
      addMsg("En El Romeral cada evento se diseña de forma personalizada. Uno de nuestros asesores especializados se pondrá en contacto contigo a la brevedad. 🤍")
      await typing(500)
      addMsg("¿Cuál es tu WhatsApp para coordinar?")
      showInput("Tu WhatsApp…", async (phone) => {
        dataRef.current.phone = phone
        setProgress(100)
        await typing(900)
        addMsg("¡Perfecto! Muy pronto recibirás noticias de nuestro equipo. ¡Hasta pronto! 🌟")
        finalize()
      })
      return
    }

    const intros: Record<string, string> = {
      Boda: "¡Qué emoción! 🎉 Una Boda merece una experiencia única. Será un gusto acompañarte.",
      "XV Años": "¡Qué emoción! 🎉 Unos XV Años merecen una experiencia única. Será un gusto acompañarte.",
      Bautizo: "¡Qué emoción! 🎉 Un Bautizo merece una experiencia única. Será un gusto acompañarte.",
    }
    await typing(900)
    addMsg(intros[type] ?? `¡Qué emoción! 🎉 Será un gusto acompañarte.`)
    await typing(650)
    addMsg("¿Ya tienes fecha definida para tu evento?")
    showOpts([
      {
        label: "✅ Sí, tengo fecha",
        fn: async () => {
          setProgress(38)
          await typing(600)
          addMsg("¡Perfecto! Compártenos la fecha y revisamos disponibilidad. 📅")
          showInput("Ej: 15 de noviembre de 2026…", async (raw) => {
            if (!hasYear(raw)) {
              await typing(600)
              addMsg("Casi listo 😊 ¿Me confirmas también el año? Muchos eventos se planean con más de un año de anticipación.")
              showInput("Misma fecha con año, ej: 15 de noviembre de 2026…", async (raw2) => {
                dataRef.current.hasDate = true
                dataRef.current.date = hasYear(raw2) ? raw2 : `${raw} ${raw2}`
                await typing(900)
                addMsg("Déjame revisar nuestra agenda para esa fecha… 🗓️")
                await sleep(3000)
                addMsg("✨ Cada celebración en El Romeral se vive una sola vez. Nuestro equipo se encarga de cada detalle para que ese día sea exactamente como lo soñaste — o mejor.")
                await sleep(2000)
                await typing(1000)
                addMsg("🎉 ¡Buenas noticias! Tenemos disponibilidad para esa fecha. Es tuya si la quieres.")
                step_guests()
              })
            } else {
              dataRef.current.hasDate = true
              dataRef.current.date = raw
              await typing(900)
              addMsg("Déjame revisar nuestra agenda para esa fecha… 🗓️")
              await sleep(3000)
              addMsg("✨ Cada celebración en El Romeral se vive una sola vez. Nuestro equipo se encarga de cada detalle para que ese día sea exactamente como lo soñaste — o mejor.")
              await sleep(2000)
              await typing(1000)
              addMsg("🎉 ¡Buenas noticias! Tenemos disponibilidad para esa fecha. Es tuya si la quieres.")
              step_guests()
            }
          })
        },
      },
      {
        label: "📅 Aún no lo sé",
        fn: async () => {
          dataRef.current.hasDate = false
          setProgress(38)
          await typing(800)
          addMsg(`No te preocupes, ${dataRef.current.name} 🤍 Muchas celebraciones extraordinarias comienzan definiendo primero la visión y todo lo que desean vivir ese día.`)
          step_guests()
        },
      },
    ])
  }, [typing, addMsg, showOpts, showInput, step_guests, finalize, setProgress])

  // ─── Boot (runs once on mount) ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      await typing(1100)
      if (cancelled) return
      addMsg("Hola ✨ ¡Gracias por escribir a <strong>El Romeral – Diseño de Experiencias Integrales</strong>!")
      await typing(800)
      if (cancelled) return
      addMsg("Más que un lugar, somos el equipo que diseña, coordina y resuelve cada detalle de principio a fin. 🤍")
      await typing(700)
      if (cancelled) return
      addMsg("Para atenderte como mereces, ¿me compartes tu nombre?")
      showInput("Tu nombre…", async (name) => {
        dataRef.current.name = name
        setProgress(12)
        await typing(800)
        addMsg(`¡Mucho gusto, <strong>${name}</strong>! ✨ Será un placer atenderte.`)
        await typing(600)
        addMsg("Cuéntame, ¿qué tipo de evento estás planeando?")
        showCards([
          { label: "💍 Boda",               photo: "/images/redesign/boda-dia.jpg",  photo2: "/images/redesign/boda-noche.jpg", fn: () => step_type("Boda") },
          { label: "👑 XV Años",            photo: "/images/redesign/xv-jardin.jpg", photo2: "/images/redesign/xv-noche.jpg",   fn: () => step_type("XV Años") },
          { label: "🍼 Bautizo",            photo: "/images/redesign/bautizo.jpg",                                              fn: () => step_type("Bautizo") },
          { label: "🏢 Evento Corporativo", bg: "bg-corp",   wide: true, fn: () => step_type("corporativo") },
          { label: "🎊 Evento Social",      bg: "bg-social", wide: true, fn: () => step_type("social") },
        ])
      })
    }
    boot()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Card crossfade effect ─────────────────────────────────────────────────
  useEffect(() => {
    if (inputMode !== "cards") return
    const intervals: ReturnType<typeof setInterval>[] = []
    cards.forEach((_, i) => {
      if (!cards[i].photo2) return
      let shown = "a"
      const id = setInterval(() => {
        const el = document.querySelector(`[data-card="${i}"]`)
        if (!el) return
        const a = el.querySelector<HTMLImageElement>(".card-photo-a")
        const b = el.querySelector<HTMLImageElement>(".card-photo-b")
        if (!a || !b) return
        if (shown === "a") { a.style.opacity = "0"; b.style.opacity = "1"; shown = "b" }
        else { a.style.opacity = "1"; b.style.opacity = "0"; shown = "a" }
      }, 3000)
      intervals.push(id)
    })
    return () => intervals.forEach(clearInterval)
  }, [inputMode, cards])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar chat"
      />

      {/* Chat window */}
      <div
        className="fixed bottom-24 right-4 z-[80] w-[min(440px,calc(100vw-2rem))]"
        style={{ animation: "chatSlideUp .35s cubic-bezier(.4,0,.2,1) forwards" }}
        role="dialog"
        aria-label="Chat con El Romeral"
      >
        <div className="wc-chat">
          {/* Header */}
          <div className="wc-hdr">
            <div className="wc-hdr-av">R</div>
            <div>
              <div className="wc-hdr-name">El Romeral</div>
              <div className="wc-hdr-sub">Diseño de Experiencias Integrales</div>
            </div>
            <div className="wc-hdr-dot" />
            <button className="wc-close" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>

          {/* Progress */}
          {progress > 0 && (
            <div className="wc-prog">
              <div className="wc-prog-row">
                <span className="wc-prog-lbl">Tu experiencia</span>
                <span className="wc-prog-pct">{progress}%</span>
              </div>
              <div className="wc-prog-track">
                <div className="wc-prog-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="wc-msgs">
            {messages.map((m) => (
              <div key={m.id} className={`wc-msg wc-msg-${m.type}`}>
                <div
                  className="wc-bubble"
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
                <div className="wc-ts">{m.time}</div>
              </div>
            ))}

            {isTyping && (
              <div className="wc-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Bottom inputs */}
          <div className="wc-bottom">
            <div className="wc-divider" />

            {/* Text options */}
            {inputMode === "options" && options.length > 0 && (
              <div className="wc-opts">
                {options.map((o, i) => (
                  <button key={i} className="wc-opt" onClick={() => handleOptionClick(o)}>
                    <span className="wc-opt-n">{i + 1}</span>
                    <span className="wc-opt-t">{o.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Event type cards */}
            {inputMode === "cards" && cards.length > 0 && (
              <div className="wc-cards">
                {cards.map((c, i) => (
                  <button
                    key={i}
                    data-card={i}
                    className={`wc-card${c.wide ? " wc-card-wide" : ""}`}
                    onClick={() => handleCardClick(c)}
                  >
                    <div className="wc-card-img">
                      {c.photo2 ? (
                        <>
                          <Image src={c.photo!} alt={c.label} fill className="card-photo card-photo-a" style={{ objectFit: "cover" }} />
                          <Image src={c.photo2} alt={c.label} fill className="card-photo card-photo-b" style={{ objectFit: "cover", opacity: 0 }} />
                        </>
                      ) : c.photo ? (
                        <Image src={c.photo} alt={c.label} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div className={`wc-card-inner ${c.bg ?? ""}`} />
                      )}
                      <div className="wc-card-ov" />
                    </div>
                    <div className="wc-card-lbl">
                      {c.label} <span className="wc-card-arr">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Budget options */}
            {inputMode === "budgets" && budgets.length > 0 && (
              <div className="wc-budgets">
                {budgets.map((b, i) => {
                  const fn = async () => handleBudgetSelect(b)
                  return (
                    <button key={i} className="wc-bud" onClick={() => handleBudgetClick(b, fn)}>
                      <span className="wc-bud-amt">{b}</span>
                      <span className="wc-bud-arr">→</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text input */}
            {inputMode === "text" && (
              <div className="wc-inp-row">
                <input
                  ref={inputRef}
                  className="wc-inp"
                  type="text"
                  placeholder={textPlaceholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTextSend() }}
                />
                <button className="wc-send" onClick={handleTextSend} aria-label="Enviar">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Done state: WhatsApp button */}
            {done && (
              <div className="wc-done">
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wc-wa-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Seguir por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wc-pop {
          from { opacity: 0; transform: translateY(5px) scale(.98); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes wc-tdot {
          0%,60%,100% { transform: translateY(0); background: #A8B494; }
          30%          { transform: translateY(-5px); background: #B8935A; }
        }

        .wc-chat {
          background: #F2F5EC;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(44,36,22,.12), 0 4px 20px rgba(184,147,90,.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: min(680px, calc(100dvh - 130px));
          font-family: 'Montserrat', sans-serif;
        }

        /* Header */
        .wc-hdr {
          background: linear-gradient(135deg, #2C2416, #3D3020);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          position: relative;
        }
        .wc-hdr::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #B8935A, transparent);
        }
        .wc-hdr-av {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #B8935A, #7A5C2E);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.25rem; font-style: italic;
          color: #EFF2E8; flex-shrink: 0;
        }
        .wc-hdr-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1rem; color: #EFF2E8; letter-spacing: .04em;
        }
        .wc-hdr-sub {
          font-size: .55rem; color: #D4B483;
          letter-spacing: .1em; text-transform: uppercase; margin-top: 2px;
        }
        .wc-hdr-dot {
          width: 8px; height: 8px;
          background: #6FCF97; border-radius: 50%;
          border: 2px solid #2C2416;
          margin-left: auto; flex-shrink: 0;
        }
        .wc-close {
          background: none; border: none; color: rgba(255,255,255,.5);
          font-size: .9rem; cursor: pointer; padding: 4px 6px;
          transition: color .2s; line-height: 1; flex-shrink: 0;
        }
        .wc-close:hover { color: white; }

        /* Progress */
        .wc-prog {
          padding: 8px 18px 7px;
          background: #E8EDE0;
          border-bottom: 1px solid rgba(184,147,90,.2);
          flex-shrink: 0;
        }
        .wc-prog-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .wc-prog-lbl { font-size: .55rem; letter-spacing: .12em; text-transform: uppercase; color: #7A8A68; }
        .wc-prog-pct { font-size: .6rem; font-weight: 600; color: #B8935A; }
        .wc-prog-track { height: 3px; background: #D6DCC8; border-radius: 2px; overflow: hidden; }
        .wc-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #7A5C2E, #B8935A);
          border-radius: 2px;
          transition: width .7s cubic-bezier(.4,0,.2,1);
        }

        /* Messages */
        .wc-msgs {
          flex: 1; overflow-y: auto;
          padding: 16px 16px 8px;
          display: flex; flex-direction: column; gap: 8px;
          scroll-behavior: smooth;
        }
        .wc-msgs::-webkit-scrollbar { width: 3px; }
        .wc-msgs::-webkit-scrollbar-thumb { background: #D6DCC8; border-radius: 2px; }
        .wc-msg { display: flex; flex-direction: column; }
        .wc-msg-bot { align-items: flex-start; }
        .wc-msg-user { align-items: flex-end; }
        .wc-bubble {
          max-width: 84%; padding: 9px 13px;
          font-size: .75rem; line-height: 1.7;
          border-radius: 15px;
          animation: wc-pop .28s cubic-bezier(.4,0,.2,1) forwards;
          opacity: 0;
        }
        .wc-msg-bot .wc-bubble {
          background: #E8EDE0; color: #1E2416;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(184,147,90,.2);
          box-shadow: 0 2px 8px rgba(30,36,22,.07);
        }
        .wc-msg-user .wc-bubble {
          background: linear-gradient(135deg, #B8935A, #7A5C2E);
          color: #EFF2E8;
          border-bottom-right-radius: 4px;
          font-weight: 500;
        }
        .wc-bubble a { color: #B8935A; }
        .wc-ts { font-size: .5rem; color: #7A8A68; margin-top: 2px; padding: 0 3px; }

        /* Typing */
        .wc-typing {
          display: flex; align-items: center; gap: 5px;
          padding: 10px 14px;
          background: #E8EDE0;
          border: 1px solid rgba(184,147,90,.2);
          border-radius: 15px; border-bottom-left-radius: 4px;
          align-self: flex-start;
          box-shadow: 0 2px 8px rgba(30,36,22,.07);
        }
        .wc-typing span {
          width: 5px; height: 5px;
          background: #A8B494; border-radius: 50%;
          animation: wc-tdot 1.3s ease-in-out infinite;
        }
        .wc-typing span:nth-child(2) { animation-delay: .18s; }
        .wc-typing span:nth-child(3) { animation-delay: .36s; }

        /* Bottom */
        .wc-bottom { flex-shrink: 0; }
        .wc-divider { height: 1px; background: rgba(184,147,90,.2); margin: 0 14px; }

        /* Options */
        .wc-opts {
          padding: 7px 12px 9px;
          display: flex; flex-direction: column; gap: 5px;
          max-height: 200px; overflow-y: auto;
        }
        .wc-opt {
          background: #E8EDE0;
          border: 1px solid rgba(184,147,90,.25);
          border-radius: 9px;
          padding: 8px 12px;
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: all .18s;
          text-align: left; font-family: 'Montserrat', sans-serif;
          width: 100%;
        }
        .wc-opt:hover {
          background: #FDF6EC;
          border-color: #B8935A;
          transform: translateX(3px);
        }
        .wc-opt-n {
          width: 19px; height: 19px;
          border: 1px solid #D4B483; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: .55rem; color: #B8935A; font-weight: 600; flex-shrink: 0;
        }
        .wc-opt-t { font-size: .72rem; color: #1E2416; flex: 1; }

        /* Cards */
        .wc-cards {
          padding: 7px 12px 9px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6px; max-height: 240px; overflow-y: auto;
        }
        .wc-card {
          border: 1.5px solid rgba(184,147,90,.25);
          border-radius: 10px; overflow: hidden;
          cursor: pointer; transition: all .22s;
          background: #E8EDE0; text-align: left;
          width: 100%;
        }
        .wc-card:hover { border-color: #B8935A; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30,36,22,.1); }
        .wc-card-wide { grid-column: 1 / -1; }
        .wc-card-img { height: 88px; position: relative; overflow: hidden; }
        .wc-card-inner { width: 100%; height: 100%; background-size: cover; background-position: center; transition: transform .4s; }
        .wc-card:hover .wc-card-inner { transform: scale(1.06); }
        .card-photo { position: absolute; inset: 0; transition: opacity 1.2s ease; }
        .card-photo-a { opacity: 1; }
        .card-photo-b { opacity: 0; }
        .wc-card-ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(44,36,22,.5), transparent 55%); }
        .wc-card-lbl {
          padding: 8px 11px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: .88rem; color: #1E2416;
          display: flex; align-items: center; justify-content: space-between;
        }
        .wc-card-arr { font-size: .65rem; color: #B8935A; }
        .bg-corp   { background: linear-gradient(145deg, #0D0D0D, #1C2333 50%, #2C3E50); }
        .bg-social { background: linear-gradient(145deg, #1A0A28, #3D1A5E 50%, #6B2FA0); }

        /* Budgets */
        .wc-budgets {
          padding: 7px 12px 9px;
          display: flex; flex-direction: column; gap: 5px;
        }
        .wc-bud {
          background: #E8EDE0;
          border: 1px solid rgba(184,147,90,.25);
          border-radius: 9px;
          padding: 9px 13px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: all .18s;
          font-family: 'Montserrat', sans-serif; width: 100%;
        }
        .wc-bud:hover { background: #FDF6EC; border-color: #B8935A; }
        .wc-bud-amt { font-size: .72rem; color: #1E2416; }
        .wc-bud-arr { font-size: .65rem; color: #B8935A; }

        /* Text input */
        .wc-inp-row {
          padding: 8px 12px 10px;
          display: flex; gap: 8px; align-items: center;
        }
        .wc-inp {
          flex: 1; background: #E8EDE0;
          border: 1px solid rgba(184,147,90,.3);
          border-radius: 9px;
          padding: 9px 13px;
          font-size: .72rem; color: #1E2416;
          font-family: 'Montserrat', sans-serif;
          outline: none;
        }
        .wc-inp:focus { border-color: #B8935A; }
        .wc-inp::placeholder { color: #7A8A68; }
        .wc-send {
          background: #B8935A; color: white;
          border: none; border-radius: 9px;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: background .2s;
        }
        .wc-send:hover { background: #7A5C2E; }

        /* Done / WA button */
        .wc-done { padding: 8px 12px 10px; }
        .wc-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%; padding: 11px;
          background: #25D366; color: white;
          border-radius: 10px; text-decoration: none;
          font-size: .72rem; letter-spacing: .08em;
          font-family: 'Montserrat', sans-serif; font-weight: 500;
          transition: background .2s;
        }
        .wc-wa-btn:hover { background: #1eba57; }
      `}</style>
    </>
  )
}
