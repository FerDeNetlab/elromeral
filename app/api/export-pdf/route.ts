import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parsePartidas } from "@/lib/parse-partidas"
import { TABULADOR_INSTALACIONES, PRECIOS_PISTA_PINTADA } from "@/app/configurador/constants"

function calcularPrecioInstalaciones(numInvitados: number): number {
  for (const rango of TABULADOR_INSTALACIONES) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.precio
    }
  }
  return TABULADOR_INSTALACIONES[TABULADOR_INSTALACIONES.length - 1].precio
}

function calcularPrecioPista(numInvitados: number): number {
  for (const rango of PRECIOS_PISTA_PINTADA) {
    if (numInvitados >= rango.min && numInvitados <= rango.max) {
      return rango.precio
    }
  }
  return PRECIOS_PISTA_PINTADA[PRECIOS_PISTA_PINTADA.length - 1].precio
}

// PDF v2.0 - Completamente rehecho basado en cotización web
// Incluye: Logo oficial, contacto del cliente, beneficios, términos homologados

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug requerido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: quote, error } = await supabase.from("quotes").select("*").eq("slug", slug).single()

    if (error || !quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    const partidasDetalle = parsePartidas(quote.partidas_detalle, quote)

    const generarTablaPartidas = () => {
      let html = ""

      if (!Array.isArray(partidasDetalle) || partidasDetalle.length === 0) {
        return '<tr><td colspan="4" style="padding: 40px; text-align: center; color: #71717a;">No hay desglose disponible</td></tr>'
      }

      partidasDetalle.forEach((categoriaData: any) => {
        if (!categoriaData || !Array.isArray(categoriaData.items)) return

        const totalCategoria = categoriaData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0)

        const esRentaInstalaciones =
          categoriaData.categoria?.toLowerCase().includes("renta") ||
          categoriaData.categoria?.toLowerCase().includes("instalaciones")
        const esDireccionIntegral =
          categoriaData.categoria?.toLowerCase().includes("dirección") ||
          categoriaData.categoria?.toLowerCase().includes("evento")

        html += `
          <tr class="categoria-header">
            <td colspan="4">${categoriaData.categoria || "Sin categoría"}</td>
          </tr>
        `

        if (esRentaInstalaciones) {
          html += `
            <tr>
              <td colspan="4" style="padding: 0;">
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; margin: 0; border-left: 4px solid #22c55e;">
                  <div style="color: #15803d; font-weight: 500; margin-bottom: 8px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">🏛️ Beneficio Exclusivo</div>
                  <div style="color: #166534; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
                    Al contratar todos los servicios con El Romeral para tu boda, obtienes un beneficio exclusivo en la renta de instalaciones.
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: #16a34a; text-decoration: line-through; font-size: 13px;">
                      Valor regular: $${(totalCategoria + 20000).toLocaleString("es-MX")} MXN
                    </div>
                    <div style="color: #15803d; font-weight: 600; font-size: 16px;">
                      Precio con beneficio: $${totalCategoria.toLocaleString("es-MX")} MXN
                    </div>
                  </div>
                  <div style="color: #15803d; font-size: 11px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #bbf7d0; display: flex; align-items: start;">
                    <span style="margin-right: 8px; flex-shrink: 0;">✓</span>
                    <span>Beneficio de $20,000 MXN aplicable únicamente al contratar todos los servicios con El Romeral (se pueden exceptuar: fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ)</span>
                  </div>
                </div>
              </td>
            </tr>
          `
        }

        if (esDireccionIntegral && totalCategoria === 0) {
          html += `
            <tr>
              <td colspan="4" style="padding: 0;">
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; margin: 0; border-left: 4px solid #22c55e;">
                  <div style="color: #15803d; font-weight: 500; margin-bottom: 8px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">🎯 Servicio de Cortesía</div>
                  <div style="color: #166534; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
                    El Romeral no solo es un venue, contamos con todos los servicios in house para que tu evento fluya con orden y tranquilidad.
                  </div>
                  <div style="color: #15803d; font-weight: 500; margin-bottom: 8px; font-size: 12px;">Incluye:</div>
                  <ul style="list-style: none; padding: 0; margin: 0; color: #166534; font-size: 12px;">
                    <li style="padding: 4px 0; display: flex; align-items: start;">
                      <span style="color: #22c55e; margin-right: 8px;">•</span>
                      <span>Producción creativa del evento</span>
                    </li>
                    <li style="padding: 4px 0; display: flex; align-items: start;">
                      <span style="color: #22c55e; margin-right: 8px;">•</span>
                      <span>Coordinación operativa el día del evento (minuto a minuto)</span>
                    </li>
                    <li style="padding: 4px 0; display: flex; align-items: start;">
                      <span style="color: #22c55e; margin-right: 8px;">•</span>
                      <span>Coordinación con fotógrafo, video, grupos musicales y social DJ</span>
                    </li>
                    <li style="padding: 4px 0; display: flex; align-items: start;">
                      <span style="color: #22c55e; margin-right: 8px;">•</span>
                      <span>Coordinación de vinos y licores en botella cerrada</span>
                    </li>
                  </ul>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #bbf7d0;">
                    <div style="color: #16a34a; text-decoration: line-through; font-size: 13px;">
                      Valor regular: $40,500 MXN
                    </div>
                    <div style="color: #15803d; font-weight: 600; font-size: 16px;">
                      Cortesía: $0 MXN
                    </div>
                  </div>
                  <div style="color: #15803d; font-size: 11px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #bbf7d0; display: flex; align-items: start;">
                    <span style="margin-right: 8px; flex-shrink: 0;">✓</span>
                    <span>Cortesía aplicable únicamente al contratar todos los servicios con El Romeral (se pueden exceptuar: Fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ)</span>
                  </div>
                </div>
              </td>
            </tr>
          `
        }

        categoriaData.items.forEach((item: any) => {
          html += `
            <tr>
              <td class="text-center">${item.cantidad || 1}</td>
              <td>${item.descripcion || ""}</td>
              <td class="text-right">$${(item.precioUnitario || 0).toLocaleString("es-MX")}</td>
              <td class="text-right">$${(item.total || 0).toLocaleString("es-MX")}</td>
            </tr>
          `
        })

        html += `
          <tr class="subtotal-row">
            <td colspan="3" class="text-right">Subtotal ${categoriaData.categoria || ""}:</td>
            <td class="text-right">$${totalCategoria.toLocaleString("es-MX")}</td>
          </tr>
        `
      })

      return html
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización ${quote.nombres} - El Romeral</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Montserrat', sans-serif; 
      color: #18181b; 
      line-height: 1.6; 
      padding: 60px; 
      background: #ffffff;
      font-weight: 300;
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 60px; 
      padding-bottom: 40px; 
      border-bottom: 1px solid #e4e4e7; 
    }
    
    .logo { 
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px; 
      font-weight: 300; 
      color: #18181b; 
      letter-spacing: 8px;
      text-transform: uppercase;
      line-height: 1.2;
      /* Updated logo style for official branding */
    }
    
    .couple-names {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 400;
      color: #18181b;
      text-align: center;
      margin-bottom: 8px;
      font-style: italic;
    }
    
    .subtitle {
      font-size: 12px;
      color: #71717a;
      text-align: center;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 50px;
    }
    
    .info-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 0;
      margin-bottom: 50px;
      border: 1px solid #e4e4e7;
    }
    
    .info-item { 
      padding: 24px 20px; 
      text-align: center;
      border-right: 1px solid #e4e4e7;
    }
    
    .info-item:last-child {
      border-right: none;
    }
    
    .info-label { 
      font-size: 10px; 
      color: #71717a; 
      text-transform: uppercase; 
      letter-spacing: 2px;
      margin-bottom: 8px; 
    }
    
    .info-value { 
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px; 
      color: #18181b; 
      font-weight: 500; 
    }
    
    .section-title { 
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px; 
      font-weight: 400; 
      color: #18181b; 
      text-align: center;
      margin-bottom: 30px;
      letter-spacing: 2px;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 40px;
    }
    
    th { 
      background: #fafafa; 
      color: #71717a; 
      padding: 16px 20px; 
      text-align: left; 
      font-weight: 400; 
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 1px solid #e4e4e7;
      border-top: 1px solid #e4e4e7;
    }
    
    td { 
      padding: 14px 20px; 
      border-bottom: 1px solid #f4f4f5; 
      font-size: 13px;
      color: #3f3f46;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    .categoria-header td { 
      background: #fafafa; 
      font-weight: 500; 
      color: #18181b; 
      font-size: 12px; 
      padding: 16px 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-top: 1px solid #e4e4e7;
      border-bottom: 1px solid #e4e4e7;
    }
    
    .subtotal-row td { 
      background: #fafafa;
      font-weight: 500; 
      padding: 12px 20px;
      color: #18181b;
      font-size: 12px;
    }
    
    .total-section { 
      margin: 50px 0;
      padding: 40px; 
      background: #18181b; 
      color: white; 
      text-align: center;
    }
    
    .total-label { 
      font-size: 10px; 
      font-weight: 400;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #a1a1aa;
      margin-bottom: 12px;
    }
    
    .total-amount { 
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px; 
      font-weight: 300;
      letter-spacing: 2px;
    }
    
    .total-note {
      font-size: 11px;
      color: #71717a;
      margin-top: 8px;
      letter-spacing: 1px;
    }
    
    .conditions {
      margin-top: 50px;
      padding-top: 40px;
      border-top: 1px solid #e4e4e7;
    }
    
    .conditions-title { 
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 400;
      color: #18181b;
      text-align: center;
      margin-bottom: 24px;
      letter-spacing: 1px;
    }
    
    .conditions-text { 
      font-size: 11px; 
      color: #71717a; 
      line-height: 1.8;
      text-align: justify;
    }
    
    .conditions-text p {
      margin-bottom: 8px;
    }
    
    .footer { 
      margin-top: 60px; 
      padding-top: 30px; 
      border-top: 1px solid #e4e4e7; 
      text-align: center; 
      color: #a1a1aa; 
      font-size: 10px;
      letter-spacing: 2px;
    }
    
    .footer-links {
      margin-top: 12px;
      color: #71717a;
    }

    @media print {
      body { padding: 40px; }
      .total-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .categoria-header td, .subtotal-row td, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <!-- Official El Romeral logo without tagline -->
    <div class="logo">EL<br>ROMERAL</div>
  </div>

  <div class="couple-names">${quote.nombres || "Cotización de Boda"}</div>
  <div class="subtitle">Cotización de Boda</div>

  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Fecha de Cotización</div>
      <div class="info-value">${new Date(quote.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Invitados</div>
      <div class="info-value">${quote.num_invitados || 0}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Fecha del Evento</div>
      <div class="info-value">${quote.fecha_evento ? new Date(quote.fecha_evento).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "Por definir"}</div>
    </div>
  </div>

  ${
    quote.email || quote.telefono
      ? `
  <div style="margin-bottom: 50px; padding: 20px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 4px;">
    <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; text-align: center;">Información de Contacto</div>
    <div style="display: grid; grid-template-columns: ${quote.email && quote.telefono ? "repeat(2, 1fr)" : "1fr"}; gap: 20px; text-align: center;">
      ${
        quote.email
          ? `
        <div>
          <div style="font-size: 10px; color: #71717a; margin-bottom: 4px;">Email</div>
          <div style="font-size: 13px; color: #18181b;">${quote.email}</div>
        </div>
      `
          : ""
      }
      ${
        quote.telefono
          ? `
        <div>
          <div style="font-size: 10px; color: #71717a; margin-bottom: 4px;">Teléfono</div>
          <div style="font-size: 13px; color: #18181b;">${quote.telefono}</div>
        </div>
      `
          : ""
      }
    </div>
  </div>
  `
      : ""
  }

  <div class="section-title">Desglose de Inversión</div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 10%">Cant.</th>
        <th style="width: 50%">Descripción</th>
        <th style="width: 20%" class="text-right">Precio</th>
        <th style="width: 20%" class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${generarTablaPartidas()}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-label">Total Experiencia Integral</div>
    <div class="total-amount">$${Number(quote.precio_total || 0).toLocaleString("es-MX")}</div>
    <div class="total-note">MXN + IVA</div>
  </div>

  <div class="conditions">
    <div class="conditions-title">Condiciones Comerciales</div>
    <div class="conditions-text">
      <p>Esta propuesta es válida únicamente a la fecha de su emisión. Transcurrida la fecha, los precios y condiciones podrán modificarse sin previo aviso. La propuesta será vinculante únicamente una vez aceptada por escrito por ambas partes.</p>
      <p>Todos los servicios incluidos en esta propuesta están sujetos a disponibilidad y fechas hasta la firma del contrato y el bloqueo de 25k MXN.</p>
      <p>A los 30 días de realizar el bloqueo de fecha, deberá llevar a cabo el pago del 30% del total del proyecto para congelar los precios estipulados en la propuesta. El resto de los pagos será a meses sin intereses hasta un mes antes del evento estar liquidado en su totalidad.</p>
      <p>Precios antes de IVA.</p>
      <p>Cancelaciones mayores a 181 días previos al evento se deberá liquidar el 60% del precio pactado por daños y perjuicios. Cancelaciones entre 1 y 180 días previos al evento deberá liquidar el 100% del precio pactado por concepto de daños y perjuicios.</p>
      <p>Para llevar a cabo una experiencia integral con Romeral todos los servicios de su boda deberán ser contratados con El Romeral (a excepción de Fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ).</p>
    </div>
  </div>

  <div class="footer">
    <div>www.elromeralvenue.com</div>
    <div class="footer-links">Guadalajara, Jalisco · México</div>
  </div>
</body>
</html>
`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="cotizacion-${slug}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error al exportar PDF:", error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
