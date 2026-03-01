import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Check, MapPin, Phone, Mail, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Eventos Diurnos - El Romeral Jardín de Eventos",
  description:
    "Celebra tu evento diurno rodeado de naturaleza, jardines, lago cristalino y capilla consagrada. Todo en un mismo lugar.",
}

export default function EventosDiurnosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-background/95 backdrop-blur-sm border-b border-foreground/5">
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

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden pt-20 md:pt-24">
        <Image
          src="/images/zabdi-20acal-3.jpg"
          alt="Eventos diurnos en El Romeral"
          fill
          quality={90}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
          <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase mb-6 font-light">Celebra bajo el sol</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.12em] uppercase mb-6 max-w-4xl">
            Eventos Diurnos
          </h1>
          <p className="text-sm md:text-base font-light max-w-2xl leading-relaxed opacity-90">
            Todo en un mismo lugar: organizador de eventos, decoración, lago, capilla, jardines, banquete, música,
            terraza y alberca
          </p>
        </div>
      </section>

      {/* Tu evento perfecto */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
              El Romeral
            </p>
            <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-8">Tu Evento Perfecto</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-base md:text-lg font-light text-muted-foreground leading-relaxed mb-8">
                24 años de trayectoria respaldan el liderazgo de El Romeral como líder en planificación de eventos.
              </p>
              <p className="text-sm md:text-base font-light text-muted-foreground/80 leading-relaxed">
                No importa cual sea tu idea, nosotros la haremos realidad para que celebres a lo grande sin preocuparte
                por nada. Con nuestro equipo de creativos te ayudaremos a planear y diseñar todo tu evento de principio
                a fin.
              </p>
            </div>
          </div>

          {/* Grid de características */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
            {[
              "Organizador de eventos",
              "Decoración",
              "Lago",
              "Capilla",
              "Jardines",
              "Banquete",
              "Música",
              "Terraza",
              "Alberca",
              "Todo en un lugar",
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-3 h-3 bg-foreground/20 rounded-full mx-auto mb-3" />
                <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-light">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiencia Integral - PRIMERO */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
              Solución integral
            </p>
            <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-8">Experiencia Integral</h2>
            <p className="text-sm md:text-base font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Una experiencia completa que incluye todo lo necesario para tu evento perfecto
            </p>
          </div>

          {/* Lista completa detallada */}
          <div className="space-y-3 mb-12">
            {/* Renta e infraestructura */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Renta e Infraestructura</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• 5 horas de renta de las instalaciones de El Romeral + 1 hora en área de alberca para recepción y/o coctelería</p>
                <p>• Planta de luz <span className="italic text-xs">(Para garantizar el uso de las áreas generales de El Romeral)</span></p>
                <p>• Estacionamiento <span className="italic text-xs">(Bardeado e iluminado para 350 autos)</span></p>
                <p>• Servicio de valet parking</p>
                <p>• Seguridad</p>
              </div>
            </details>

            {/* Menú y gastronomía */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Menú y Gastronomía</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• Menú a elegir a 2 tiempos: <span className="italic">Lomo, pollo o pescado blanco + entrada individual crema ensalada o postré individual, incluye canasto de pan de mesa</span></p>
                <p>• Vajilla ondulada francesa: <span className="italic">Plato base y cubertería 18/10 de acero inoxidable</span></p>
                <p>• Descorche de cortesía</p>
              </div>
            </details>

            {/* Barra de bebidas */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Barra de Bebidas Sin Alcohol</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• Mobiliario de barra, hielo, cristalería y bar tender</p>
                <p>• Refresco producto coca cola, squirt, agua quina</p>
                <p>• Jugos: Naranja, uva, piña, arándano y agua natural</p>
              </div>
            </details>

            {/* Personal y servicio */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Personal y Servicio</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• 1 mesero por cada 15 personas</p>
                <p>• Coordinador de evento</p>
              </div>
            </details>

            {/* Montaje y decoración */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Montaje y Decoración</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• Montaje mesa: <span className="italic">Redonda/cuadrada, silla inyectada, mantel tergal catalán en cualquier color, cubre mantel organza liso, servilleta de tela</span></p>
                <p>• Molleton <span className="italic">(Acojinamiento de mesa)</span></p>
                <p>• Floristería: <span className="italic">Centros de mesa buqué flor natural 40 cm. de diámetro a nivel de mesa</span></p>
                <p>• Plano de mesas numerado</p>
                <p>• Menús de mesa impresos</p>
                <p>• Numeración de mesas <span className="italic">(En totem madera o color plata)</span></p>
              </div>
            </details>

            {/* Música y entretenimiento */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Música y Entretenimiento</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• Música ambiental <span className="italic">(Equipo Bose)</span></p>
              </div>
            </details>

            {/* Espacios */}
            <details className="border border-foreground/10 bg-background rounded-sm overflow-hidden group">
              <summary className="cursor-pointer p-6 hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground/60" />
                  <span className="font-light tracking-wide">Espacios</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 space-y-3 text-sm text-muted-foreground font-light">
                <p>• Salón para 130 invitados o toldo para más invitados</p>
              </div>
            </details>
          </div>

          {/* Cortesías Integral */}
          <div className="mt-12 border-2 border-foreground/20 bg-gradient-to-br from-background to-muted/30 p-8 md:p-10 rounded-sm">
            <h3 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-8 text-center">
              Cortesías Integral
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground/50 mt-2 flex-shrink-0" />
                  <p className="text-sm font-light leading-relaxed">
                    <strong className="font-medium">PRECIO PREFERENCIAL EN RENTA DE INSTALACIONES</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground/50 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-light leading-relaxed">
                      <strong className="font-medium">1 HORA EXTRA</strong>
                    </p>
                    <p className="text-xs text-muted-foreground/70 italic mt-1">
                      (El área de la alberca para coctelería)
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground/50 mt-2 flex-shrink-0" />
                  <p className="text-sm font-light leading-relaxed">
                    <strong className="font-medium">CISNES NEGROS Y GANSOS AFRICANOS EN EL LAGO</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-foreground/50 mt-2 flex-shrink-0" />
                  <p className="text-sm font-light leading-relaxed">
                    <strong className="font-medium">USO DE BOTE Y REMOS PARA SESIÓN FOTOGRÁFICA</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios que puede contratar por su cuenta */}
          <div className="mt-8 border border-foreground/10 bg-background p-8 md:p-10 rounded-sm">
            <h4 className="text-xl md:text-2xl tracking-[0.15em] uppercase font-light mb-6 text-center">
              ¿Qué servicios puede ingresar por tu propia cuenta?
            </h4>
            <div className="space-y-4 max-w-3xl mx-auto text-sm text-muted-foreground font-light">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Vinos y licores en botella cerrada</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">
                    (No servicios a proveedores externos de barras de vinos y licores)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Fotógrafo y video</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Mariachi</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Souvenirs</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">
                    (Cilindros, pantuflas, etc)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Grupo Musical</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">
                    (Se rentará con El Romeral la planta de luz para grupo musical y/o tarimas)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-foreground/10 bg-muted/50 p-6 md:p-8 rounded-sm">
            <p className="text-xs font-light text-muted-foreground/70 leading-relaxed text-center">
              <strong className="font-medium">Importante:</strong> Cualquier otro servicio que se requiera deberá ser contratado con El Romeral "Sin excepción" para que aplique el regalo de Experiencia Integral.
            </p>
          </div>
        </div>
      </section>

      {/* Tarifas Experiencia Integral */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
              Inversión completa
            </p>
            <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-8">
              Tarifas Experiencia Integral
            </h2>
            <p className="text-sm font-light text-muted-foreground">
              Incluye renta de instalaciones + paquete experiencia integral
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { 
                invitados: "50", 
                experienciaIntegral: "$79,660", 
                rentaPreferencial: "$89,000",
                precioFinal: "$168,640"
              },
              { 
                invitados: "100", 
                experienciaIntegral: "$144,000", 
                rentaPreferencial: "$119,000",
                precioFinal: "$263,000"
              },
              { 
                invitados: "150", 
                experienciaIntegral: "$208,100", 
                rentaPreferencial: "$149,000",
                precioFinal: "$357,100"
              },
              { 
                invitados: "200", 
                experienciaIntegral: "$272,300", 
                rentaPreferencial: "$159,000",
                precioFinal: "$431,300"
              },
              { 
                invitados: "250", 
                experienciaIntegral: "$336,500", 
                rentaPreferencial: "$169,000",
                precioFinal: "$505,500"
              },
              { 
                invitados: "300", 
                experienciaIntegral: "$400,500", 
                rentaPreferencial: "$179,000",
                precioFinal: "$579,500"
              },
            ].map((tarifa, index) => (
              <div
                key={index}
                className="border border-foreground/10 bg-muted/20 p-6 text-center hover:border-foreground/20 transition-colors"
              >
                <p className="text-5xl font-light mb-2">{tarifa.invitados}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-6">Invitados</p>
                
                <div className="space-y-3 text-sm mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground/70 mb-1">Experiencia Integral:</p>
                    <p className="text-lg font-light">{tarifa.experienciaIntegral}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/70 mb-1 italic">Precio Preferencial Renta Romeral:</p>
                    <p className="text-base font-light">{tarifa.rentaPreferencial}</p>
                  </div>
                </div>
                
                <div className="border-t-2 border-foreground/20 pt-4 mt-4 bg-background/50 -mx-6 px-6 py-4">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Precio Final</p>
                  <p className="text-2xl font-medium">{tarifa.precioFinal}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-sm text-muted-foreground font-light text-center max-w-3xl mx-auto">
            <p className="text-red-600/80 italic">
              ** Sin excepción todos los servicios extras, deberán contratarse con El Romeral para poder aplicar la promo "Experiencia Integral".
            </p>
            <p>• Precios en moneda nacional, no incluyen I.V.A.</p>
          </div>

          {/* Condiciones Comerciales Experiencia Integral */}
          <div className="mt-16 border border-foreground/10 bg-muted/50 p-8 md:p-10 rounded-sm">
            <h3 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-8 text-center">
              Condiciones Comerciales en Experiencia Integral
            </h3>
            <div className="space-y-4 max-w-4xl mx-auto text-sm text-muted-foreground font-light">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Precios en moneda nacional.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">No incluye I.V.A.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Bloqueo de fecha con <strong className="font-medium">$25,000 pesos.</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Pago del <strong className="font-medium">35% del total del evento al mes</strong> para congelar los precios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Beneficio de pagos en <strong className="font-medium">mensualidades sin intereses</strong>, pago de última mensualidad un mes antes de la fecha del evento.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Pagos extemporáneos se les aplicará el <strong className="font-medium">10% por pago extemporáneo.</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong className="font-medium">CAMBIOS DE FECHA</strong> aplica únicamente cuando por disposición gubernamental no se puedan realizar eventos, el evento se programará a la próxima fecha disponible dentro de los 365 días a la fecha del evento previamente pactado, en cambios de fecha posteriores a 365 días de la fecha previamente pactada aplicará ajuste de precios en alimentos, bebidas y floristería.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Cancelaciones <strong className="font-medium">mayores a 181 días previos al evento</strong> se retendrá el 60% del precio pactado concepto de daños y perjuicios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Cancelaciones <strong className="font-medium">entre 1 día y 180 días previos al evento</strong> deberá liquidar en su totalidad el precio pactado por concepto de daños y perjuicios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Depósito en garantía, en efectivo un mes antes del evento el cual se regresará 8 días posteriores al evento.
                </p>
              </div>
            </div>
          </div>

          {/* Servicios Opcionales */}
          <div className="mt-16 border border-foreground/10 bg-background p-8 md:p-10 rounded-sm">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl tracking-[0.15em] uppercase font-light mb-4">
                Servicios Opcionales
              </h3>
              <p className="text-sm text-muted-foreground font-light italic">
                Para complementar tu evento
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-5xl mx-auto text-sm text-muted-foreground font-light">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Gran variedad de opciones de banquete a elegir.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Capilla autorizada para ceremonias religiosas.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Variedad de mantelerías.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Barra de vinos, licores y digestivos.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Coctelería para ceremonia civil.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Barra de café.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Cena para desvelados.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Saxofonista, percusiones, cuarteto de jazz para boda civil.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Toldo alemán color negro o Ivory, panorámico blanco.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Decoración de tu evento a la medida</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">(cortinas de leds, focos vintage, etc...)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Opciones de mobiliario alta calidad</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">(Luis XV, avant gard, mesas de cristal, parota, etc...)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="leading-relaxed">Florista</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">(Donas de flores gigantes en toldo, decoración en capilla, bouquet para ceremonia civil)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Coro para ceremonia religiosa en capilla El Cristo de El Romeral.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Pirotecnia</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Candys Bar</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Mesa de quesos y/o jamones</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Tarimas para pista</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Salas lounge</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Cabina de fotos</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Calefactores</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Globo gigante aerostático</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Grupos musicales</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Alimentos para el staff contratado por clientes.</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-foreground/10 text-center">
              <p className="text-xs text-muted-foreground/70 font-light italic">
                Todos los servicios sujetos a cotización
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Renta de Instalaciones */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
              Por número de invitados
            </p>
            <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-8">
              Renta de Instalaciones
            </h2>
          </div>

          {/* Tabla de precios */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { 
                invitados: "50", 
                viernesSabado: "$109,000", 
                entreSemanaDomingo: "$89,000", 
                preferencial: "$89,000",
                horaExtra: "$7,700",
                deposito: "$20,000"
              },
              { 
                invitados: "100", 
                viernesSabado: "$139,000", 
                entreSemanaDomingo: "$119,000", 
                preferencial: "$119,000",
                horaExtra: "$8,200",
                deposito: "$22,000"
              },
              { 
                invitados: "150", 
                viernesSabado: "$169,000", 
                entreSemanaDomingo: "$149,000", 
                preferencial: "$149,000",
                horaExtra: "$8,900",
                deposito: "$24,000"
              },
              { 
                invitados: "200", 
                viernesSabado: "$179,000", 
                entreSemanaDomingo: "$159,000", 
                preferencial: "$159,000",
                horaExtra: "$9,400",
                deposito: "$26,000"
              },
              { 
                invitados: "250", 
                viernesSabado: "$189,000", 
                entreSemanaDomingo: "$169,000", 
                preferencial: "$169,000",
                horaExtra: "$10,500",
                deposito: "$28,000"
              },
            ].map((tarifa, index) => (
              <div
                key={index}
                className="border border-foreground/10 p-6 hover:border-foreground/20 transition-colors"
              >
                <div className="text-center mb-6 pb-6 border-b border-foreground/10">
                  <p className="text-5xl font-light mb-2">{tarifa.invitados}</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Invitados</p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground font-light">Viernes o Sábado:</span>
                    <span className="text-lg font-light">{tarifa.viernesSabado}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground font-light">Do, Lu, Ma, Mi o Ju:</span>
                    <span className="text-lg font-light">{tarifa.entreSemanaDomingo}</span>
                  </div>
                  
                  <div className="border border-foreground/20 bg-background/50 p-4 rounded-sm mt-4">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Precio Preferencial</p>
                    <p className="text-[10px] text-muted-foreground/70 mb-2 italic">Experiencia Integral</p>
                    <p className="text-xs text-muted-foreground mb-1">Viernes o Sábado: <span className="font-medium">{tarifa.preferencial}</span></p>
                    <p className="text-xs text-muted-foreground">Depósito garantía: <span className="font-medium">{tarifa.deposito}</span></p>
                  </div>
                  
                  <div className="pt-3 border-t border-foreground/10">
                    <p className="text-xs text-muted-foreground">Hora extra: <span className="font-medium">{tarifa.horaExtra}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Depósito garantía: <span className="font-medium">{tarifa.deposito}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lo que incluye */}
          <div className="border border-foreground/10 bg-background p-8 rounded-sm">
            <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-6 text-center">Incluye</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  "6 horas de renta de las instalaciones de El Romeral",
                  "Planta de luz para garantizar el uso de las áreas generales de El Romeral",
                  "Estacionamiento bardeado para 250 autos",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0 text-foreground/60" />
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  "Servicio de valet parking",
                  "Personal de seguridad",
                  "Mantenimiento en baños y estacionamiento",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0 text-foreground/60" />
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-foreground/10">
              <p className="text-xs text-muted-foreground/70 italic text-center">
                *Domingo en puente se toma a precio de viernes y sábado
              </p>
            </div>
          </div>

          {/* Cortesías */}
          <div className="mt-12 border border-foreground/10 bg-background p-8 rounded-sm">
            <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-6 text-center">Cortesías</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-light text-muted-foreground">
                    <span className="font-medium">Bride room.</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">Disponible durante las horas del evento.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="text-sm font-light text-muted-foreground">Cisne negro y patos en el lago.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-light text-muted-foreground">Fogata decorativa en el lago</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">Ideal para iluminar su camino hacia la recepción.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="text-sm font-light text-muted-foreground">Valet parking.</p>
              </div>
            </div>
          </div>

          {/* Condiciones Comerciales específicas de Renta de Instalaciones */}
          <div className="mt-8 border border-foreground/10 bg-muted/50 p-8 rounded-sm">
            <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-6 text-center">Condiciones Comerciales</h4>
            <div className="space-y-4 text-sm text-muted-foreground font-light max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Bloqueo de fecha con el <strong className="font-medium">50% de anticipo.</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed"><strong className="font-medium">50% del finiquito 2 meses previos</strong> a la fecha de tu evento.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">Pagos extemporáneos se les aplicará el <strong className="font-medium">10% por pago tardío.</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  <strong className="font-medium">CAMBIOS DE FECHA</strong> aplica únicamente cuando por disposición gubernamental no se puedan realizar eventos, el evento se programará a la próxima fecha disponible dentro de los 365 días a la fecha del evento previamente pactado, en cambios de fecha posteriores a 365 días de la fecha previamente pactada aplicará ajuste de precios renta de instalaciones.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Cancelaciones entre <strong className="font-medium">1 día y 180 días previos al evento</strong> deberá liquidar en su totalidad el precio pactado por concepto de daños y perjuicios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Cancelaciones <strong className="font-medium">mayores a 181 días previos al evento</strong> se retendrá el 50% del precio pactado por concepto de daños y perjuicios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">No incluye I.V.A.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  Depósito en garantía, en efectivo un mes antes del evento el cual se regresará 8 días posteriores al evento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capilla - Detalle completo */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
              <Image
                src="/images/portada-capilla-1.jpg"
                alt="Capilla consagrada"
                fill
                quality={85}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
                Todo en un mismo lugar
              </p>
              <h3 className="text-3xl md:text-4xl tracking-[0.12em] uppercase font-light mb-8">
                Cristo Del Romeral
              </h3>
              <p className="text-sm font-light text-muted-foreground mb-8 leading-relaxed italic">
                Capilla autorizada para ceremonias religiosas.
              </p>
              <div className="space-y-6 text-muted-foreground">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="font-light">Oficiamiento de ceremonia religiosa.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="font-light">Alfombra roja, azul o ivory.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="font-light">4 sillones para padrinos, sillón tejido en tule para el sacerdote.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="font-light">Valet Parking</p>
                  </div>
                </div>
                <div className="border-t border-foreground/10 pt-6 mt-8">
                  <p className="text-sm text-muted-foreground/70 mb-2 italic">Precio desde:</p>
                  <p className="text-3xl font-light mb-2">$22,000</p>
                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Renta de capilla</p>
                </div>
                <a
                  href="http://www.arquidiocesisgdl.org/busqueda_directorio_templos.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs tracking-[0.2em] uppercase underline underline-offset-4 hover:opacity-70 transition-opacity mt-4"
                >
                  Verificar en directorio oficial
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Condiciones Comerciales */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
              Información importante
            </p>
            <h2 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-8">
              Condiciones Comerciales
            </h2>
          </div>

          <div className="space-y-8">
            {/* Apartado */}
            <div className="border-l-2 border-foreground/20 pl-6">
              <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-4">Apartado de fecha</h4>
              <div className="space-y-3 text-sm text-muted-foreground font-light">
                <p>
                  • Para apartar su fecha se requiere el <strong className="font-medium">50% del total de la renta de las instalaciones</strong>
                </p>
                <p>
                  • Dicho apartado será por un período de <strong className="font-medium">10 días hábiles</strong>, en los cuales se requiere
                  firmar contrato para conservar la reservación
                </p>
                <p>
                  • El monto del anticipo <strong className="font-medium">no es reembolsable</strong> bajo ninguna circunstancia
                </p>
              </div>
            </div>

            {/* Pagos */}
            <div className="border-l-2 border-foreground/20 pl-6">
              <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-4">Plan de pagos</h4>
              <div className="space-y-3 text-sm text-muted-foreground font-light">
                <p>
                  • <strong className="font-medium">4 meses antes:</strong> 50% restante de la renta de instalaciones
                </p>
                <p>
                  • <strong className="font-medium">3 meses antes:</strong> 50% del total del evento
                </p>
                <p>
                  • <strong className="font-medium">10 días antes:</strong> Liquidación total del evento
                </p>
              </div>
            </div>

            {/* Formas de pago */}
            <div className="border-l-2 border-foreground/20 pl-6">
              <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-4">Formas de pago</h4>
              <div className="space-y-3 text-sm text-muted-foreground font-light">
                <p>• Transferencia bancaria</p>
                <p>• Tarjeta de crédito (aplica comisión bancaria)</p>
                <p>• Efectivo</p>
                <p>• Cheque certificado</p>
              </div>
            </div>

            {/* Garantías */}
            <div className="border-l-2 border-foreground/20 pl-6">
              <h4 className="text-lg tracking-[0.15em] uppercase font-light mb-4">Garantías y depósitos</h4>
              <div className="space-y-3 text-sm text-muted-foreground font-light">
                <p>
                  • Se requiere un <strong className="font-medium">depósito en garantía de $5,000</strong> que será devuelto al término del
                  evento si no hay daños a las instalaciones
                </p>
                <p>
                  • El depósito se entrega en efectivo o cheque el día del evento
                </p>
              </div>
            </div>

            {/* Notas importantes */}
            <div className="bg-muted/30 border border-foreground/10 p-6 md:p-8 rounded-sm">
              <h4 className="text-base tracking-[0.15em] uppercase font-light mb-4">Notas importantes</h4>
              <div className="space-y-3 text-xs text-muted-foreground font-light leading-relaxed">
                <p>
                  • Todos los precios están sujetos a cambios sin previo aviso y no incluyen I.V.A.
                </p>
                <p>
                  • Las cotizaciones tienen una vigencia de 10 días hábiles
                </p>
                <p>
                  • Para aplicar la promoción "Experiencia Integral", todos los servicios extras deben contratarse con El Romeral
                </p>
                <p>
                  • El horario del evento debe respetarse estrictamente. Tiempo extra tiene costo adicional
                </p>
                <p>
                  • No se permite el ingreso de alimentos o bebidas de proveedores externos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decoración */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/images/mesa-rey-arturo.jpg"
          alt="Decoración personalizada"
          fill
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4 font-light">La imaginación es el límite</p>
          <h3 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-6">Decoración</h3>
          <p className="text-sm md:text-base font-light max-w-2xl leading-relaxed opacity-90">
            Tal como lo soñaste, nosotros te ayudaremos a diseñar y crear toda la decoración de tu evento con tu
            temática. No importa la idea, la haremos realidad para que tu evento sea tan mágico como único.
          </p>
        </div>
      </section>

      {/* El Lago */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
                El encanto de un lago
              </p>
              <h3 className="text-3xl md:text-4xl tracking-[0.12em] uppercase font-light mb-8">
                Celebra Rodeado de Naturaleza
              </h3>
              <div className="space-y-6 text-muted-foreground">
                <p className="font-light leading-relaxed">
                  Nada más hermoso que celebrar entre la naturaleza. Organiza tu sesión de fotos en el muelle del lago
                  o celebra una ceremonia alrededor de la fogata.
                </p>
                <div className="grid grid-cols-2 gap-6 py-8">
                  <div>
                    <p className="text-4xl md:text-5xl font-light mb-2">200</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase">Karpas Koi</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-light mb-2">1.2M</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase">Litros de agua</p>
                  </div>
                </div>
                <p className="text-sm font-light opacity-80">
                  ¿Quieres saber porque el agua luce tan cristalina? Nuestro sistema de depuración es natural
                  (Biopiscina)
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/romeral12.jpg"
                alt="Lago con cisnes y patos"
                fill
                quality={85}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capilla */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <Image
          src="/images/portada-capilla-1.jpg"
          alt="Capilla consagrada"
          fill
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4 font-light">
            La única en Jalisco dentro de un espacio privado
          </p>
          <h3 className="text-3xl md:text-5xl tracking-[0.12em] uppercase font-light mb-6">Capilla Consagrada</h3>
          <p className="text-sm md:text-base font-light max-w-2xl leading-relaxed opacity-90 mb-6">
            Sabemos que prefieres comodidad y seguridad para tus invitados por eso El Romeral te facilita nuestra
            capilla con validez. Sin duda, el escenario perfecto.
          </p>
          <a
            href="http://www.arquidiocesisgdl.org/busqueda_directorio_templos.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-[0.2em] uppercase underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Más detalles
          </a>
        </div>
      </section>

      {/* Jardines */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src="/images/zabdi-acal-83.jpg"
                alt="Jardines con desnivel"
                fill
                quality={85}
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-light">
                La magia de la naturaleza
              </p>
              <h3 className="text-3xl md:text-4xl tracking-[0.12em] uppercase font-light mb-8">
                Jardines con Desnivel
              </h3>
              <p className="font-light leading-relaxed text-muted-foreground mb-8">
                El jardín principal de El Romeral es el lugar perfecto para realizar tu evento de día. Con grandes
                espacios y escenarios naturales a su alrededor capaces de llenar de sutileza y encanto cada detalle de
                tu evento.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl md:text-4xl font-light mb-2">130+</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Árboles</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-light mb-2">10k m²</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">en jardines</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-light mb-2">10x18</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Alberca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 md:py-32 px-6 md:px-12 text-center bg-muted/30">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-8 font-light">
          Tu celebración perfecta te espera
        </p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl tracking-[0.12em] uppercase font-light mb-12">
          Agenda Tu Visita
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            asChild
            className="px-10 py-6 text-[11px] tracking-[0.25em] uppercase rounded-none bg-foreground hover:bg-foreground/90"
          >
            <a href="https://cal.com/ricardo-heredia-jxuu3m" target="_blank" rel="noopener noreferrer">
              <Calendar className="w-4 h-4 mr-3" />
              Agendar Cita
            </a>
          </Button>

        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm font-light text-muted-foreground">
          <a
            href="tel:3338708159"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            (33) 3870-8159
          </a>
          <span className="hidden md:inline text-muted-foreground/30">·</span>
          <a
            href="mailto:contacto@elromeral.com.mx"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            contacto@elromeral.com.mx
          </a>
          <span className="hidden md:inline text-muted-foreground/30">·</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Prol. Av. Vallarta 2951, Zapopan
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-foreground/5 text-center">
        <p className="text-[9px] tracking-[0.2em] text-muted-foreground/60 font-light uppercase">
          © 2026 El Romeral · 24 años de experiencia · Zapopan, Jalisco
        </p>
      </footer>
    </div>
  )
}
