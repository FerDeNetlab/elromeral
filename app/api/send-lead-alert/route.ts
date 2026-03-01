import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  console.log("[v0] === INICIO send-lead-alert ===")

  try {
    // Verificar variables de entorno
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY no está configurada")
      return NextResponse.json({ success: false, error: "RESEND_API_KEY no configurada" }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("[v0] SUPABASE_URL no está configurada")
      return NextResponse.json({ success: false, error: "Variables de Supabase no configuradas" }, { status: 500 })
    }

    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseKey) {
      console.error("[v0] SUPABASE_KEY no está configurada")
      return NextResponse.json({ success: false, error: "Variables de Supabase no configuradas" }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey)

    console.log("[v0] Parseando body del request...")
    const body = await request.json()
    console.log("[v0] Body recibido:", JSON.stringify(body, null, 2))

    const {
      nombres,
      email,
      telefono,
      fechaEvento,
      numInvitados,
      tipoEvento,
      paso,
      cotizacionCompleta,
      detallesCotizacion,
      totalFormateado,
      slug,
    } = body

    console.log("[v0] Datos extraídos:", { nombres, email, paso, cotizacionCompleta })

    // Obtener emails de alerta
    console.log("[v0] Consultando emails de alerta en Supabase...")
    const { data: alertEmails, error: emailsError } = await supabase
      .from("alert_emails")
      .select("email, nombre")
      .eq("activo", true)

    if (emailsError) {
      console.error("[v0] Error obteniendo emails de alerta:", emailsError)
      return NextResponse.json({ success: false, error: emailsError.message }, { status: 500 })
    }

    console.log("[v0] Emails de alerta encontrados:", alertEmails)

    if (!alertEmails || alertEmails.length === 0) {
      console.log("[v0] No hay emails de alerta configurados, retornando éxito")
      return NextResponse.json({ success: true, message: "No hay emails configurados" })
    }

    const emailList = alertEmails.map((e) => e.email)
    console.log("[v0] Lista de emails para enviar:", emailList)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elromeral.com.mx"

    // Formatear fecha
    const fechaFormateada = fechaEvento
      ? new Date(fechaEvento + "T00:00:00").toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No especificada"

    let subject: string
    let htmlContent: string

    if (cotizacionCompleta) {
      subject = `Nueva cotización completa - ${nombres}`
      const detallesHtml =
        detallesCotizacion && detallesCotizacion.length > 0
          ? detallesCotizacion
              .map(
                (d: string) =>
                  `<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">• ${d}</div>`,
              )
              .join("")
          : "<div style='padding: 8px 0; color: #666;'>Sin detalles adicionales</div>"

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
            <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">El Romeral</h1>
              <div style="background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 10px; display: inline-block;">COTIZACION COMPLETADA</div>
            </div>
            <div style="padding: 30px;">
              <p><strong>Cliente:</strong> ${nombres}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${telefono}</p>
              <p><strong>Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>Invitados:</strong> ${numInvitados} personas</p>
              <div style="margin: 20px 0;">${detallesHtml}</div>
              <p style="font-size: 24px; text-align: center;"><strong>Total: ${totalFormateado}</strong></p>
              <p style="text-align: center;"><a href="${siteUrl}/cotizacion/${slug}" style="background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; display: inline-block;">Ver Cotización</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    } else {
      subject = `Nuevo lead - ${nombres || "Sin nombre"} (Paso ${paso}/13)`
      const progressPercent = Math.round((paso / 13) * 100)

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
            <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">El Romeral</h1>
              <div style="background: #f59e0b; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 10px; display: inline-block;">NUEVO LEAD</div>
            </div>
            <div style="padding: 30px;">
              <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin: 20px 0;">
                <div style="background: #1a1a1a; height: 100%; border-radius: 4px; width: ${progressPercent}%;"></div>
              </div>
              <p style="text-align: center; color: #666;">Progreso: Paso ${paso} de 13 (${progressPercent}%)</p>
              <p><strong>Nombres:</strong> ${nombres || "No especificado"}</p>
              <p><strong>Email:</strong> ${email || "No especificado"}</p>
              <p><strong>Teléfono:</strong> ${telefono || "No especificado"}</p>
              <p><strong>Fecha del evento:</strong> ${fechaFormateada}</p>
              <p><strong>Invitados:</strong> ${numInvitados || "No especificado"}</p>
              <div style="background: #fef3c7; padding: 15px; color: #92400e; margin: 20px 0; text-align: center; border-radius: 8px;">
                Este cliente no completó la cotización. Se quedó en el paso ${paso}.
              </div>
              <p style="text-align: center;"><a href="${siteUrl}/admin/crm" style="background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; display: inline-block;">Ver en el CRM</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    console.log("[v0] Enviando email con Resend...")
    console.log("[v0] Subject:", subject)
    console.log("[v0] To:", emailList)

    try {
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: "El Romeral <noreply@elromeral.com.mx>",
        to: emailList,
        subject,
        html: htmlContent,
      })

      if (sendError) {
        console.error("[v0] Error de Resend:", sendError)

        // Si es error 429 (límite diario alcanzado), retornar éxito para no romper el flujo
        if (sendError.message?.includes("429") || sendError.message?.includes("daily_quota_exceeded")) {
          console.log("[v0] Límite diario de correos alcanzado, pero permitiendo continuar")
          return NextResponse.json({
            success: true,
            warning:
              "Límite diario de correos alcanzado. La cotización se guardó correctamente pero no se enviaron alertas por email.",
          })
        }

        return NextResponse.json({ success: false, error: sendError.message }, { status: 500 })
      }

      console.log("[v0] Email enviado exitosamente:", sendData)
      console.log("[v0] === FIN send-lead-alert (éxito) ===")
      return NextResponse.json({ success: true, data: sendData })
    } catch (emailError: any) {
      // Capturar errores de red o fetch que también pueden ser 429
      console.error("[v0] Error al enviar email:", emailError)

      if (
        emailError.statusCode === 429 ||
        emailError.message?.includes("429") ||
        emailError.message?.includes("quota")
      ) {
        console.log("[v0] Límite diario alcanzado (catch), permitiendo continuar")
        return NextResponse.json({
          success: true,
          warning: "Límite diario de correos alcanzado. La cotización se guardó correctamente.",
        })
      }

      throw emailError
    }
  } catch (error) {
    console.error("[v0] Error general en send-lead-alert:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
