import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      nombres,
      email,
      telefono,
      fechaEvento,
      numInvitados,
      menuPrincipal,
      partidas,
      totalGeneral,
      totalesPorCategoria,
    } = data

    const generarTablaPartidas = () => {
      let html = ""

      totalesPorCategoria.forEach(({ categoria, total }: { categoria: string; total: number }) => {
        if (total === 0) return

        const partidasCategoria = partidas.filter((p: any) => p.categoria === categoria)
        if (partidasCategoria.length === 0) return

        html += `
          <tr class="categoria-header">
            <td colspan="4"><strong>${categoria}</strong></td>
          </tr>
        `

        partidasCategoria.forEach((partida: any) => {
          html += `
            <tr>
              <td class="text-center">${partida.cantidad}</td>
              <td>${partida.nombre}</td>
              <td class="text-right">$${partida.precio_unitario.toLocaleString("es-MX")}</td>
              <td class="text-right"><strong>$${partida.total.toLocaleString("es-MX")}</strong></td>
            </tr>
          `
        })

        html += `
          <tr class="subtotal-row">
            <td colspan="3" class="text-right"><strong>Subtotal ${categoria}</strong></td>
            <td class="text-right"><strong>$${total.toLocaleString("es-MX")}</strong></td>
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
  <title>Cotización - El Romeral</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #2d3748;
      line-height: 1.6;
      padding: 40px;
      background: #ffffff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #99c952;
    }
    
    .logo {
      font-size: 36px;
      font-weight: 300;
      color: #6c6e70;
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    
    .tagline {
      font-size: 14px;
      color: #99c952;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #99c952;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      padding: 12px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      color: #2d3748;
      font-weight: 500;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th {
      background: #99c952;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .categoria-header td {
      background: #f7fafc;
      font-weight: 600;
      color: #6c6e70;
      font-size: 14px;
      padding: 12px;
      border-top: 2px solid #99c952;
      border-bottom: 1px solid #cbd5e0;
    }
    
    .subtotal-row td {
      background: #f1f5f9;
      font-weight: 600;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e0;
    }
    
    .total-section {
      margin-top: 30px;
      padding: 20px;
      background: #99c952;
      color: white;
      border-radius: 8px;
      text-align: center;
    }
    
    .total-label {
      font-size: 18px;
      font-weight: 300;
      margin-bottom: 8px;
    }
    
    .total-amount {
      font-size: 36px;
      font-weight: 700;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #718096;
      font-size: 12px;
    }
    
    .contact-info {
      margin-top: 15px;
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }
    
    .notes-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .notes-text {
      font-size: 13px;
      color: #78350f;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">EL ROMERAL</div>
    <div class="tagline">JARDÍN SALÓN CAPILLA · Guadalajara</div>
  </div>

  <div class="section">
    <div class="section-title">Información del Evento</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Novios</div>
        <div class="info-value">${nombres}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Teléfono</div>
        <div class="info-value">${telefono}</div>
      </div>
      ${
        fechaEvento
          ? `
      <div class="info-item">
        <div class="info-label">Fecha del Evento</div>
        <div class="info-value">${fechaEvento}</div>
      </div>
      `
          : ""
      }
      <div class="info-item">
        <div class="info-label">Número de Invitados</div>
        <div class="info-value">${numInvitados} personas</div>
      </div>
      <div class="info-item">
        <div class="info-label">Menú Principal</div>
        <div class="info-value">${menuPrincipal}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fecha de Cotización</div>
        <div class="info-value">${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Desglose de Servicios</div>
    <table>
      <thead>
        <tr>
          <th style="width: 10%">Cantidad</th>
          <th style="width: 50%">Descripción</th>
          <th style="width: 20%" class="text-right">Precio Unitario</th>
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
    <div class="total-amount">$${totalGeneral.toLocaleString("es-MX")} MXN</div>
  </div>

  <div class="notes">
    <div class="notes-title">Notas Importantes:</div>
    <div class="notes-text">
      • Esta cotización tiene una validez de 30 días.<br>
      • Los precios están sujetos a cambios sin previo aviso.<br>
      • Para confirmar su reservación se requiere un anticipo del 50%.<br>
      • El saldo restante deberá liquidarse 15 días antes del evento.<br>
      • Todos los servicios están sujetos a disponibilidad.<br>
      • Los precios no incluyen IVA.
    </div>
  </div>

  <div class="footer">
    <p>Esta cotización fue generada desde www.romeralvenue.com</p>
    <div class="contact-info">
      <div>📞 (33) 1234-5678</div>
      <div>✉️ contacto@elromeral.com</div>
      <div>📍 Guadalajara, Jalisco</div>
    </div>
  </div>
</body>
</html>
`

    return NextResponse.json({
      success: true,
      html: htmlContent,
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ success: false, error: "Error al generar el PDF" }, { status: 500 })
  }
}
