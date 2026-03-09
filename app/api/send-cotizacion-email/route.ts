import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { sanitizeHtml } from "@/lib/utils"

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
    try {
        const { to, contactName, titulo, slug, total, fechaEvento, numInvitados } = await request.json()

        if (!to || !slug) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
        }

        if (!isValidEmail(to)) {
            return NextResponse.json({ success: false, skipped: true, reason: "Email inválido" }, { status: 200 })
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: "API de email no configurada" }, { status: 500 })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elromeral.com.mx"
        const safeSlug = encodeURIComponent(slug)
        const quoteUrl = `${siteUrl}/cotizacion-adicionales/${safeSlug}`
        const safeName = sanitizeHtml(contactName || "")
        const safeTitulo = sanitizeHtml(titulo || "Cotización")
        const formattedTotal = new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(total || 0)

        const formattedDate = fechaEvento
            ? new Date(fechaEvento + "T00:00:00").toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : "Por definir"

        const { data, error } = await resend.emails.send({
            from: "El Romeral <noreply@elromeral.com.mx>",
            to: Array.isArray(to) ? to : [to],
            subject: `${safeTitulo} - El Romeral`,
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
              </div>
              
              <div style="padding: 40px;">
                <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 400; text-align: center;">
                  ¡Hola ${safeName}!
                </h2>
                
                <p style="color: #666666; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                  Les compartimos su ${safeTitulo.toLowerCase()} personalizada. 
                  Pueden revisarla, seleccionar los conceptos de su interés y descargarla en PDF.
                </p>
                
                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    ${fechaEvento ? `<tr>
                      <td style="padding: 10px 0; color: #888; font-size: 13px;">Fecha del evento</td>
                      <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${formattedDate}</td>
                    </tr>` : ""}
                    ${numInvitados ? `<tr>
                      <td style="padding: 10px 0; color: #888; font-size: 13px;">Invitados</td>
                      <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${Number(numInvitados)} personas</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 15px 0 0 0; color: #888; font-size: 13px; border-top: 1px solid #ddd;">Total estimado</td>
                      <td style="padding: 15px 0 0 0; color: #c9a96e; font-size: 22px; font-weight: 600; text-align: right; border-top: 1px solid #ddd;">${formattedTotal}</td>
                    </tr>
                  </table>
                </div>
                
                <a href="${quoteUrl}" style="display: block; background-color: #c9a96e; color: #ffffff; text-align: center; padding: 18px 32px; text-decoration: none; border-radius: 4px; font-size: 14px; letter-spacing: 1px; margin-bottom: 20px;">
                  VER MI COTIZACIÓN
                </a>
                
                <p style="color: #888888; font-size: 13px; text-align: center; margin: 0;">
                  Este enlace es permanente y pueden acceder en cualquier momento:<br>
                  <a href="${quoteUrl}" style="color: #c9a96e;">${quoteUrl}</a>
                </p>
              </div>
              
              <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">
                  ¿Tienen alguna pregunta?
                </p>
                <p style="margin: 0; color: #888888; font-size: 13px;">
                  Contáctenos por WhatsApp o llámenos, estaremos encantados de atenderles.
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

        return NextResponse.json({ success: true, data })
    } catch (error) {
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
