import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Condiciones de Servicio | El Romeral",
    description:
        "Condiciones de servicio de El Romeral. Términos y condiciones que rigen el uso de nuestro sitio web y servicios.",
}

export default function CondicionesDeServicio() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/40 bg-background/95 backdrop-blur">
                <div className="mx-auto max-w-3xl px-6 py-6">
                    <Link
                        href="/"
                        className="font-serif text-2xl font-light tracking-widest text-primary hover:opacity-80 transition-opacity"
                    >
                        EL ROMERAL
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-6 py-12">
                <h1 className="font-serif text-3xl font-light tracking-wide text-foreground mb-2">
                    Condiciones de Servicio
                </h1>
                <p className="text-sm text-muted-foreground mb-10">
                    Última actualización: 1 de marzo de 2026
                </p>

                <div className="space-y-8 text-foreground/90 leading-relaxed text-[15px]">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            1. Aceptación de los términos
                        </h2>
                        <p>
                            Al acceder y utilizar el sitio web de El Romeral (
                            <a
                                href="https://elromeral.com.mx"
                                className="text-primary underline underline-offset-2"
                            >
                                elromeral.com.mx
                            </a>
                            ), así como nuestros servicios de comunicación por WhatsApp y
                            correo electrónico, aceptas cumplir con estas Condiciones de
                            Servicio. Si no estás de acuerdo con alguno de estos términos, te
                            pedimos que no utilices nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            2. Descripción del servicio
                        </h2>
                        <p>
                            El Romeral es un jardín para bodas y eventos ubicado en
                            Guadalajara, Jalisco, México. A través de nuestro sitio web y
                            canales de comunicación ofrecemos:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Información sobre nuestras instalaciones y servicios</li>
                            <li>Herramientas de cotización en línea</li>
                            <li>Comunicación automatizada y asistida por WhatsApp</li>
                            <li>Gestión de reservas y coordinación de eventos</li>
                            <li>Envío de cotizaciones y documentos por correo electrónico</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            3. Uso del sitio web
                        </h2>
                        <p>Al utilizar nuestro sitio web, te comprometes a:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>Proporcionar información veraz y actualizada</li>
                            <li>No utilizar el sitio para fines ilegales o no autorizados</li>
                            <li>
                                No intentar acceder a áreas restringidas del sitio sin
                                autorización
                            </li>
                            <li>
                                No reproducir, duplicar o explotar comercialmente el contenido
                                del sitio sin autorización
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            4. Comunicación por WhatsApp
                        </h2>
                        <p>
                            Al iniciar una conversación con nosotros a través de WhatsApp,
                            aceptas recibir mensajes relacionados con tu consulta, incluyendo
                            respuestas automatizadas y seguimiento de tu solicitud.
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                            <li>
                                Puedes dejar de recibir mensajes en cualquier momento
                                escribiendo {'"'}BAJA{'"'} o {'"'}STOP{'"'}
                            </li>
                            <li>
                                Los mensajes automatizados son orientativos; para información
                                vinculante, consulta con nuestro equipo directamente
                            </li>
                            <li>
                                No compartiremos tu número de WhatsApp con terceros para fines
                                de marketing
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            5. Cotizaciones y precios
                        </h2>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                                Las cotizaciones generadas en el sitio web son de carácter
                                informativo y están sujetas a disponibilidad
                            </li>
                            <li>
                                Los precios mostrados son antes de IVA, salvo que se indique lo
                                contrario
                            </li>
                            <li>
                                Una cotización es válida únicamente a la fecha de su emisión;
                                después de esa fecha, los precios pueden modificarse sin previo
                                aviso
                            </li>
                            <li>
                                La cotización será vinculante únicamente una vez aceptada por
                                escrito por ambas partes y realizado el bloqueo correspondiente
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            6. Reservas y cancelaciones
                        </h2>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                                La reserva de fecha requiere un bloqueo de $25,000 MXN y la
                                firma de contrato
                            </li>
                            <li>
                                A los 30 días del bloqueo, se deberá realizar el pago del 30%
                                del total para congelar precios
                            </li>
                            <li>
                                Cancelaciones con más de 181 días de anticipación: se deberá
                                liquidar el 60% del precio pactado
                            </li>
                            <li>
                                Cancelaciones entre 1 y 180 días de anticipación: se deberá
                                liquidar el 100% del precio pactado
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            7. Propiedad intelectual
                        </h2>
                        <p>
                            Todo el contenido del sitio web, incluyendo textos, imágenes,
                            logotipos, diseños y código, es propiedad de El Romeral o se
                            utiliza con la debida autorización. Queda prohibida su
                            reproducción, distribución o uso comercial sin autorización
                            previa por escrito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            8. Limitación de responsabilidad
                        </h2>
                        <p>
                            El Romeral no será responsable por daños directos o indirectos que
                            puedan derivarse del uso del sitio web, interrupciones del
                            servicio, errores en el contenido o pérdida de datos. El sitio web
                            se proporciona {'"'}tal cual{'"'} sin garantías de ningún tipo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            9. Privacidad
                        </h2>
                        <p>
                            El tratamiento de tus datos personales se rige por nuestra{" "}
                            <Link
                                href="/politica-de-privacidad"
                                className="text-primary underline underline-offset-2"
                            >
                                Política de Privacidad
                            </Link>
                            , la cual forma parte integral de estas Condiciones de Servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            10. Modificaciones
                        </h2>
                        <p>
                            Nos reservamos el derecho de modificar estas Condiciones de
                            Servicio en cualquier momento. Las modificaciones serán efectivas
                            desde su publicación en esta página. El uso continuado de nuestros
                            servicios después de cualquier cambio constituye la aceptación de
                            los nuevos términos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            11. Legislación aplicable
                        </h2>
                        <p>
                            Estas Condiciones de Servicio se rigen por las leyes de los
                            Estados Unidos Mexicanos. Cualquier controversia será resuelta
                            ante los tribunales competentes de Guadalajara, Jalisco, México.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            12. Contacto
                        </h2>
                        <p>
                            Para cualquier duda sobre estas condiciones, contáctanos:
                        </p>
                        <ul className="list-none space-y-1 mt-2 ml-2">
                            <li>
                                📧{" "}
                                <a
                                    href="mailto:eventos@elromeral.mx"
                                    className="text-primary underline underline-offset-2"
                                >
                                    eventos@elromeral.mx
                                </a>
                            </li>
                            <li>📞 33 3870 8159</li>
                            <li>📍 Guadalajara, Jalisco, México</li>
                        </ul>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-border/40 text-center">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </main>
        </div>
    )
}
