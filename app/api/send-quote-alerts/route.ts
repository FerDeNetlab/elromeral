import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { sanitizeHtml } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "API de email no configurada" }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Base de datos no configurada" }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { quoteName, quoteSlug, quoteTotal, quoteDate, numInvitados } = await request.json()

    if (!quoteName || !quoteSlug) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Obtener lista de correos de alerta activos
    const { data: alertEmails, error: dbError } = await supabase.from("alert_emails").select("email").eq("activo", true)

    if (dbError) {
      return NextResponse.json({ error: "Error obteniendo correos" }, { status: 500 })
    }

    if (!alertEmails || alertEmails.length === 0) {
      return NextResponse.json({ success: true, message: "No hay correos de alerta configurados" })
    }

    const emails = alertEmails.map((e) => e.email)

    // Sanitizar y formatear datos
    const safeName = sanitizeHtml(quoteName)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elromeral.com.mx"
    const safeSlug = encodeURIComponent(quoteSlug)
    const quoteUrl = `${siteUrl}/cotizacion/${safeSlug}`
    const formattedTotal = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(quoteTotal || 0)

    const formattedDate = quoteDate
      ? new Date(quoteDate + "T00:00:00").toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      : "Por definir"

    const { data, error } = await resend.emails.send({
      from: "El Romeral <noreply@elromeral.com.mx>",
      to: emails,
      subject: `Nueva Cotización Completa: ${safeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 4px;">EL ROMERAL</h1>
                <div style="background-color: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; margin-top: 15px; display: inline-block;">COTIZACIÓN COMPLETADA</div>
              </div>
              
              <div style="padding: 40px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Nombres</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a; font-size: 14px; font-weight: 500; text-align: right;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Fecha del evento</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a; font-size: 14px; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Invitados</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #1a1a1a; font-size: 14px; text-align: right;">${Number(numInvitados) || 0} personas</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #888; font-size: 13px;">Total cotizado</td>
                    <td style="padding: 12px 0; color: #c9a96e; font-size: 20px; font-weight: 600; text-align: right;">${formattedTotal}</td>
                  </tr>
                </table>
                
                <a href="${quoteUrl}" style="display: block; background-color: #1a1a1a; color: #ffffff; text-align: center; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-size: 14px; letter-spacing: 1px; margin-bottom: 15px;">
                  VER COTIZACIÓN COMPLETA
                </a>
                
                <a href="${siteUrl}/admin/crm" style="display: block; background-color: transparent; color: #1a1a1a; text-align: center; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-size: 14px; letter-spacing: 1px; border: 1px solid #1a1a1a;">
                  IR AL CRM
                </a>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #888888; font-size: 12px;">
                  Este es un correo automático del sistema de cotizaciones de El Romeral.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailsSent: emails.length, data })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
