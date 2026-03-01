import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug requerido" }, { status: 400 })
    }

    // Obtener datos de la cotización
    const { data: quote, error } = await supabase.from("quotes").select("*").eq("slug", slug).single()

    if (error || !quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    const formatearFecha = (fecha: string) => {
      if (!fecha) return ""
      const date = new Date(fecha + "T00:00:00")
      return date.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const numInvitados = quote.num_invitados || 100
    let precioInstalaciones = 119000
    if (numInvitados <= 100) precioInstalaciones = 119000
    else if (numInvitados <= 150) precioInstalaciones = 149000
    else if (numInvitados <= 200) precioInstalaciones = 169000
    else if (numInvitados <= 250) precioInstalaciones = 189000
    else if (numInvitados <= 300) precioInstalaciones = 229000
    else if (numInvitados <= 350) precioInstalaciones = 259000
    else precioInstalaciones = 299000

    const precioInstalacionesReal = precioInstalaciones + 20000

    // Generar tabla de partidas
    const generarTablaPartidas = () => {
      let html = ""
      const partidas = quote.partidas_detalle || []
      let rentaBeneficioMostrado = false

      for (const partida of partidas) {
        html += `
          <tr class="categoria-header">
            <td colspan="4"><strong>${partida.categoria}</strong></td>
          </tr>
        `

        for (const item of partida.items || []) {
          html += `
            <tr>
              <td class="text-center">${item.cantidad}</td>
              <td>${item.descripcion}</td>
              <td class="text-right">$${item.precioUnitario?.toLocaleString("es-MX") || 0}</td>
              <td class="text-right"><strong>$${item.total?.toLocaleString("es-MX") || 0}</strong></td>
            </tr>
          `
        }

        const subtotal = (partida.items || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0)
        html += `
          <tr class="subtotal-row">
            <td colspan="3" class="text-right"><strong>Subtotal ${partida.categoria}</strong></td>
            <td class="text-right"><strong>$${subtotal.toLocaleString("es-MX")}</strong></td>
          </tr>
        `

        if (partida.categoria === "Instalaciones" && subtotal > 0 && !rentaBeneficioMostrado) {
          rentaBeneficioMostrado = true
          const valorReal = subtotal + 20000
          html += `
            <tr>
              <td colspan="4" style="padding: 0;">
                <div class="benefit-box" style="margin: 15px 8px;">
                  <div class="benefit-title">🏛️ Beneficio Exclusivo</div>
                  <div class="benefit-desc">
                    Al contratar todos los servicios con El Romeral para tu boda, obtienes un beneficio exclusivo en la renta de instalaciones.
                  </div>
                  <div class="benefit-price">
                    <span class="price-original">Valor real: $${valorReal.toLocaleString("es-MX")} MXN</span>
                    <span class="price-final">Precio con beneficio: $${subtotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                  <div class="benefit-details">
                    ✓ Beneficio de $20,000 MXN al contratar servicios con El Romeral<br>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #86efac; font-size: 8px;">
                      <em>Este beneficio aplica únicamente al contratar todos los servicios con El Romeral. Se pueden exceptuar: fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ.</em>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          `

          html += `
            <tr>
              <td colspan="4" style="padding: 0;">
                <div class="benefit-box" style="margin: 15px 8px;">
                  <div class="benefit-title">🎯 Dirección Integral del Evento</div>
                  <div class="benefit-desc">
                    El Romeral no solo es un venue, contamos con todos los servicios in house para que tu evento fluya con orden y tranquilidad.
                  </div>
                  <div class="benefit-details">
                    <strong>Incluye:</strong><br>
                    • Producción creativa del evento<br>
                    • Coordinación operativa el día del evento (minuto a minuto)<br>
                    • Coordinación con fotógrafo, video, grupos musicales y social DJ<br>
                    • Coordinación de vinos y licores en botella cerrada
                  </div>
                  <div class="benefit-price" style="margin-top: 12px;">
                    <span class="price-original">Valor real: $40,500 MXN</span>
                    <span class="price-final">Cortesía: $0 MXN</span>
                  </div>
                  <div class="benefit-details" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #86efac; font-size: 8px;">
                    <em>Esta cortesía aplica únicamente al contratar todos los servicios con El Romeral. Se pueden exceptuar: fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ.</em>
                  </div>
                </div>
              </td>
            </tr>
          `
        }
      }

      return html
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización - El Romeral</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
      color: #2d3748;
      line-height: 1.6;
      padding: 40px;
      background: #ffffff;
      font-size: 12px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1a1a1a;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 5px;
      letter-spacing: 4px;
      text-transform: uppercase;
      line-height: 1.2;
    }
    
    .tagline {
      font-size: 11px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .event-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
    }
    
    .event-names {
      font-size: 24px;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 10px;
      font-style: italic;
    }
    
    .event-date {
      font-size: 14px;
      color: #666;
      text-transform: capitalize;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 10px;
      background: #f7fafc;
      border-radius: 4px;
    }
    
    .info-label {
      font-size: 9px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    
    .info-value {
      font-size: 13px;
      color: #2d3748;
      font-weight: 500;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 11px;
    }
    
    th {
      background: #1a1a1a;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 500;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .categoria-header td {
      background: #f1f5f9;
      font-weight: 600;
      color: #374151;
      font-size: 11px;
      padding: 10px 8px;
      border-top: 1px solid #cbd5e0;
      border-bottom: 1px solid #cbd5e0;
    }
    
    .subtotal-row td {
      background: #f9fafb;
      font-weight: 500;
      padding: 8px;
      border-bottom: 1px solid #d1d5db;
      font-size: 11px;
    }
    
    .benefit-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    
    .benefit-title {
      font-weight: 600;
      color: #166534;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .benefit-desc {
      font-size: 10px;
      color: #15803d;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    
    .benefit-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }
    
    .price-original {
      text-decoration: line-through;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .price-final {
      font-weight: 600;
      color: #166534;
      font-size: 14px;
    }
    
    .benefit-details {
      margin-top: 10px;
      font-size: 9px;
      color: #166534;
      line-height: 1.6;
    }
    
    .total-section {
      margin-top: 25px;
      padding: 20px;
      background: #1a1a1a;
      color: white;
      text-align: center;
    }
    
    .total-label {
      font-size: 12px;
      font-weight: 300;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .total-amount {
      font-size: 28px;
      font-weight: 300;
      letter-spacing: 1px;
    }
    
    .conditions {
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .conditions-title {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .conditions-list {
      list-style: none;
      padding: 0;
    }
    
    .conditions-list li {
      font-size: 10px;
      color: #475569;
      margin-bottom: 8px;
      padding-left: 15px;
      position: relative;
      line-height: 1.5;
    }
    
    .conditions-list li:before {
      content: "•";
      position: absolute;
      left: 0;
      color: #94a3b8;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #718096;
      font-size: 10px;
    }
    
    .contact-info {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      gap: 25px;
      flex-wrap: wrap;
    }

    @media print {
      body {
        padding: 0;
      }
      .benefit-box, .conditions {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <!-- Actualizando logo a formato oficial sin tagline -->
    <div class="logo">EL<br>ROMERAL</div>
  </div>

  <div class="event-header">
    <div class="event-names">${quote.nombres || "Los Novios"}</div>
    <div class="event-date">${formatearFecha(quote.fecha_evento || "")}</div>
  </div>

  <div class="section">
    <div class="section-title">Información del Evento</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Invitados</div>
        <div class="info-value">${numInvitados} personas</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${quote.email || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Teléfono</div>
        <div class="info-value">${quote.telefono || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Menú</div>
        <div class="info-value">${quote.menu === "menu3tiempos" || quote.menu === "3tiempos" ? "Menú 3 Tiempos" : quote.menu === "parrillada" ? "Parrillada Premium" : quote.menu || "-"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Barra</div>
        <div class="info-value">${quote.barra === "premium" ? "Vinos y Licores Premium" : "Sin vinos/licores"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha de Cotización</div>
        <div class="info-value">${new Date(quote.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Desglose de Inversión</div>
    <table>
      <thead>
        <tr>
          <th style="width: 10%">Cant.</th>
          <th style="width: 50%">Descripción</th>
          <th style="width: 20%" class="text-right">Precio Unit.</th>
          <th style="width: 20%" class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${generarTablaPartidas()}
      </tbody>
    </table>
  </div>

  <div class="total-section">
    <div class="total-label">Inversión Total</div>
    <div class="total-amount">$${(quote.precio_total || 0).toLocaleString("es-MX")} MXN</div>
    <div style="font-size: 10px; margin-top: 8px; opacity: 0.8;">Precios antes de IVA</div>
  </div>

  <div class="conditions">
    <div class="conditions-title">Condiciones Comerciales</div>
    <ul class="conditions-list">
      <li>Esta propuesta es válida únicamente a la fecha de su emisión. Transcurrida la fecha, los precios y condiciones podrán modificarse sin previo aviso. La propuesta será vinculante únicamente una vez aceptada por escrito por ambas partes.</li>
      <li>Todos los servicios incluidos en esta propuesta están sujetos a disponibilidad y fechas hasta la firma del contrato y el bloqueo de 25k MXN.</li>
      <li>A los 30 días de realizar el bloqueo de fecha, deberá llevar a cabo el pago del 30% del total del proyecto para congelar los precios estipulados en la propuesta. El resto de los pagos será a meses sin intereses hasta un mes antes del evento estar liquidado en su totalidad.</li>
      <li><strong>Precios antes de IVA</strong></li>
      <li>Cancelaciones mayores a 181 días previos al evento se deberá liquidar el 60% del precio pactado por daños y perjuicios.</li>
      <li>Cancelaciones entre 1 y 180 días previos al evento deberá liquidar el 100% del precio pactado por concepto de daños y perjuicios.</li>
      <li>Para llevar a cabo una experiencia integral con Romeral todos los servicios de su boda deberán ser contratados con El Romeral. (A excepción de Fotógrafo, videógrafo, grupos versátiles, souvenirs y social DJ).</li>
    </ul>
  </div>

  <div class="footer">
    <p>Cotización generada desde romeralvenue.com</p>
    <div class="contact-info">
      <div>📞 33 3870 8159</div>
      <div>✉️ eventos@elromeral.mx</div>
      <div>📍 Guadalajara, Jalisco</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Esperar a que todas las imágenes y fuentes se carguen
      Promise.all([
        document.fonts.ready,
        ...Array.from(document.images).map(img => 
          img.complete ? Promise.resolve() : new Promise(resolve => {
            img.onload = img.onerror = resolve;
          })
        )
      ]).then(() => {
        // Delay adicional para asegurar que todo esté renderizado
        setTimeout(() => {
          window.print();
        }, 500);
      }).catch(() => {
        // Si hay error, intentar imprimir de todas formas
        setTimeout(() => {
          window.print();
        }, 1000);
      });
    }
  </script>
</body>
</html>
`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
