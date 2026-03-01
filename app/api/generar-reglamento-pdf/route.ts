import { NextResponse } from "next/server"

export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reglamento El Romeral</title>
  <style>
    @media print {
      @page { margin: 2cm; }
      body { margin: 0; }
    }
    body { 
      font-family: 'Georgia', serif; 
      font-size: 12px; 
      line-height: 1.6; 
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    h1 { 
      font-size: 24px; 
      text-align: center; 
      margin-bottom: 10px;
      font-weight: normal;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    h2 { 
      font-size: 16px; 
      margin-top: 25px; 
      margin-bottom: 12px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    p { 
      margin: 10px 0; 
      text-align: justify;
    }
    .section { 
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 20px;
      letter-spacing: 5px;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #333;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .print-button:hover {
      background: #555;
    }
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Imprimir PDF</button>
  
  <div class="header">
    <div class="logo">EL ROMERAL</div>
    <h1>Reglamento Jardín de Eventos</h1>
  </div>

  <div class="section">
    <h2>1. GENERALIDADES</h2>
    <p>1.1. El presente reglamento tiene como finalidad establecer las normas de uso y comportamiento dentro del jardín de eventos para garantizar la seguridad, orden y disfrute de todos los proveedores y asistentes.</p>
  </div>

  <div class="section">
    <h2>2. HORARIOS</h2>
    <p>2.1. El horario de uso del jardín será el acordado en el Anexo 1 y/o el que se estipule de forma escrita.</p>
    <p>2.2. El horario máximo permitido para la realización de eventos es hasta las 4:00 a.m. No se autorizarán excepciones ni extensiones después de este horario.</p>
    <p>2.3. Se otorgará acceso a proveedores el día del evento a partir de las 8 am. para montaje en Romeral Jardín de eventos. (La apertura a la capilla es 15 min previos a la ceremonia religiosa).</p>
    <p>2.4. Se podrán solicitar horas previas para montaje en días anteriores al evento (siempre y cuando se cuente con la fecha disponible) en un horario de 8am a 6pm precio por hora o fracción $3,500.00 por hora. Si se requieren horas extras fuera del horario indicado será al precio de 4,500.00 por hora en un horario de 6:00pm a 11:00 pm.</p>
    <p>2.5. Los Proveedores contarán con una hora posterior al término del evento para realizar el desmontaje de sus equipos. En caso de no lograr realizarlo en el lapso estipulado, el proveedor deberá acudir el día domingo en un horario de 10 am a 5pm.</p>
    <p>2.6. Dentro de las 6 horas de evento no está considerada la capilla, este servicio de renta de espacio con costo según lo estipulado en el anexo 1, y se rige por la parroquia.</p>
    <p>2.7. En caso de contratar el servicio de capilla esta misma es por un lapso de 60 minutos y a la finalización de este lapso darán inicio las 6 horas de evento y/o las que se haya llevado a cabo su contratación.</p>
    <p>2.8. En caso de requerir horas adicionales dentro del horario permitido, estas deberán solicitarse con anticipación y estarán sujetas a disponibilidad y a los precios vigentes al momento de su contratación.</p>
    <p>2.9. Los servicios generales de las áreas de Romeral (como lo son sanitarios) inician a partir de la hora contratada en Romeral Jardín de Eventos (Durante la ceremonia religiosa no estarán habilitados).</p>
  </div>

  <div class="section">
    <h2>3. USO DE MÚSICA Y RUIDO</h2>
    <p>3.1 La música deberá mantenerse a un máximo de 100 decibeles y cesar al término de lo estipulado en el horario pactado.</p>
    <p>3.2. En caso de desear ingresar a su evento pirotecnia y/o cascadas de pirotecnia fría, informar a Romeral jardín de eventos para su autorización previa y bajo los lineamientos establecidos.</p>
    <p>3.3 En el uso de pirotecnia el proveedor deberá presentar a El Romeral Jardín de Eventos los permisos y autorizaciones necesarios por las autoridades correspondientes, así como el seguro de daños.</p>
  </div>

  <div class="section">
    <h2>4. DECORACIÓN Y MONTAJE</h2>
    <p>4.1. No se permite clavar, excavar, pegar o pintar sobre las estructuras y construcciones del jardín ni en las áreas de jardín.</p>
    <p>4.2. El lugar en el que se instalarán los proveedores será autorizado por El Romeral.</p>
    <p>4.3. El personal y los equipos de las empresas proveedoras deberán circular sobre los pasillos de concretos asignados para carga y descarga y montajes.</p>
    <p>4.4. Los proveedores no deberán colocarse en áreas de pasillos de tráfico, se sugiere a los mismos instalar tarimas para proteger las áreas verdes y área de cocina asignada así evitar su daño y sea disminuido del depósito en garantía.</p>
    <p>4.5. Queda prohibido ingresar vehículos de carga de más de 3.5 toneladas a las instalaciones de El Romeral.</p>
    <p>4.6. 90 minutos antes de iniciar el evento ningún vehículo de proveedores podrá permanecer estacionado en entrada principal, glorieta y la rampa del jardín principal.</p>
    <p>4.7. En El Romeral no nos hacemos responsables de mobiliario, equipo o muebles que hayan olvidado los proveedores ya que no contamos con bodegas para su resguardo.</p>
    <p>4.8. Los proveedores únicamente utilizarán los sanitarios destinados para staff.</p>
    <p>4.9.Queda determinadamente prohibido tomar piedras del río y/o desarticular empedrados para usarlas como tranca en las llantas de los vehículos.</p>
  </div>

  <div class="section">
    <h2>5. ESTACIONAMIENTO Y ACCESOS</h2>
    <p>5.1. El jardín cuenta con estacionamiento para 250 vehículos (incluyendo proveedores)</p>
    <p>5.2. El jardín no se hace responsable por daños o robos a vehículos en el estacionamiento.</p>
    <p>5.3. Se deberá respetar el acomodo designado para invitados, proveedores y self parking.</p>
    <p>5.4. Se brindará acceso vehicular a los invitados 15 minutos antes del horario contratado.</p>
    <p>5.5. El inicio del servicio de valet parking iniciará 15 minutos antes del horario contratado.</p>
    <p>5.6 El estacionamiento deberá ser desalojado en un plazo máximo de una hora del término del evento.</p>
    <p>5.7 El Romeral no se hace responsable de algún vehículo u objetos dejados en el estacionamiento.</p>
  </div>

  <div class="section">
    <h2>6. HABITACIÓN</h2>
    <p>6.1. La habitación será destinada para uso de arreglo personal de la novia, bodega y/o sanitario para novios.</p>
    <p>6.2. La habitación es para un máximo de 5 personas (Novia y fotógrafos o maquillistas).</p>
    <p>6.3. Si se desea que accedan al lugar invitados cercanos para felicitaciones y/o toma de fotografías previos o posteriores al horario contratado se brindará la propuesta económica de acuerdo al tiempo y número de personas.</p>
    <p>6.4. Prohibido el acceso a niños en la habitación</p>
    <p>6.5. Prohibido introducir alimentos y fumar dentro de la misma.</p>
  </div>

  <div class="section">
    <h2>7. ENERGÍA</h2>
    <p>7.1. La planta de luz para áreas generales de Romeral se encenderá 1 hora antes del inicio del evento contratado.</p>
    <p>7.2. Si se contratase planta de luz para grupos musicales y/o Dj se encenderá 1 hora antes del inicio del evento contratado.</p>
  </div>

  <div class="section">
    <h2>8. CAPILLA</h2>
    <p>8.1 Las puertas de la capilla se abrirán 60 minutos antes del horario contratado con el fin de brindar la facilidad de hacer el acomodo de floristería, 30 minutos posteriores a la terminación del horario contratado la capilla deberá estar desmontada en accesorios y/o decoraciones.</p>
    <p>8.2 En caso de celebraciones en la Capilla, estas deberán programarse en horario corrido y continuo con la celebración de eventos en Romeral jardín de Eventos.</p>
    <p>8.3. Prohibido clavar o hacer alguna modificación en las instalaciones.</p>
  </div>

  <div class="footer">
    <p><strong>El Romeral Jardín de Eventos</strong></p>
    <p>Prolongación Av. Vallarta no 2951, Col. El Romeral, Zapopan, Jalisco</p>
    <p>contacto@elromeral.com.mx</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
