import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Política de Privacidad | El Romeral",
    description:
        "Política de privacidad de El Romeral. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
}

export default function PoliticaDePrivacidad() {
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
                    Política de Privacidad
                </h1>
                <p className="text-sm text-muted-foreground mb-10">
                    Última actualización: 1 de marzo de 2026
                </p>

                <div className="space-y-8 text-foreground/90 leading-relaxed text-[15px]">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            1. Responsable del tratamiento
                        </h2>
                        <p>
                            <strong>El Romeral</strong>, con domicilio en Guadalajara, Jalisco,
                            México, es responsable del tratamiento de los datos personales que
                            nos proporciones, de conformidad con la Ley Federal de Protección
                            de Datos Personales en Posesión de los Particulares (LFPDPPP).
                        </p>
                        <p className="mt-2">
                            Sitio web:{" "}
                            <a
                                href="https://elromeral.com.mx"
                                className="text-primary underline underline-offset-2"
                            >
                                elromeral.com.mx
                            </a>
                            <br />
                            Correo de contacto:{" "}
                            <a
                                href="mailto:eventos@elromeral.mx"
                                className="text-primary underline underline-offset-2"
                            >
                                eventos@elromeral.mx
                            </a>
                            <br />
                            Teléfono: 33 3870 8159
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            2. Datos personales que recopilamos
                        </h2>
                        <p className="mb-2">
                            Podemos recopilar los siguientes datos personales a través de
                            nuestro sitio web, WhatsApp, formularios de contacto y
                            herramientas de cotización:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Nombre completo</li>
                            <li>Correo electrónico</li>
                            <li>Número de teléfono / WhatsApp</li>
                            <li>Fecha del evento</li>
                            <li>Número de invitados</li>
                            <li>Preferencias de servicios para tu evento</li>
                            <li>
                                Información de navegación (cookies, dirección IP, tipo de
                                dispositivo)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            3. Finalidades del tratamiento
                        </h2>
                        <p className="mb-2">
                            Utilizamos tus datos personales para las siguientes finalidades:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                                Responder a tus consultas y solicitudes de información
                            </li>
                            <li>Generar y enviar cotizaciones personalizadas</li>
                            <li>
                                Gestionar la comunicación contigo a través de WhatsApp y correo
                                electrónico
                            </li>
                            <li>Coordinar y planificar tu evento</li>
                            <li>Enviarte información relevante sobre nuestros servicios</li>
                            <li>
                                Mejorar nuestro sitio web y la experiencia del usuario
                            </li>
                            <li>Cumplir con obligaciones legales aplicables</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            4. Comunicación por WhatsApp
                        </h2>
                        <p>
                            Al comunicarte con nosotros a través de WhatsApp, utilizamos la
                            API de WhatsApp Business proporcionada por Meta Platforms, Inc.
                            Los mensajes que envíes pueden ser procesados con herramientas de
                            automatización para brindarte una respuesta más rápida y eficiente.
                        </p>
                        <p className="mt-2">
                            La información compartida a través de WhatsApp (nombre, número de
                            teléfono, contenido del mensaje) se utiliza exclusivamente para
                            atender tu solicitud y no será compartida con terceros no
                            autorizados. Puedes optar por dejar de recibir mensajes en
                            cualquier momento escribiendo {'"'}BAJA{'"'} o {'"'}STOP{'"'}.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            5. Uso de cookies y tecnologías similares
                        </h2>
                        <p>
                            Nuestro sitio web utiliza cookies y tecnologías de análisis
                            (como Vercel Analytics y Google Analytics) para recopilar
                            información de navegación. Estas herramientas nos ayudan a
                            entender cómo se utiliza nuestro sitio web y mejorar la
                            experiencia del usuario. Puedes configurar tu navegador para
                            rechazar las cookies, aunque esto podría limitar algunas
                            funcionalidades del sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            6. Compartición de datos con terceros
                        </h2>
                        <p className="mb-2">
                            Podemos compartir tus datos personales con los siguientes
                            terceros, únicamente para las finalidades descritas:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                                <strong>Supabase:</strong> almacenamiento seguro de datos y
                                autenticación
                            </li>
                            <li>
                                <strong>Meta (WhatsApp Business API):</strong> comunicación por
                                WhatsApp
                            </li>
                            <li>
                                <strong>Resend:</strong> envío de correos electrónicos
                                transaccionales
                            </li>
                            <li>
                                <strong>Vercel:</strong> alojamiento del sitio web y análisis de
                                tráfico
                            </li>
                        </ul>
                        <p className="mt-2">
                            Estos proveedores cuentan con sus propias políticas de privacidad
                            y medidas de seguridad. No vendemos ni alquilamos tus datos
                            personales a terceros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            7. Seguridad de los datos
                        </h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para
                            proteger tus datos personales contra acceso no autorizado,
                            pérdida, alteración o destrucción. Esto incluye el uso de
                            conexiones cifradas (HTTPS), almacenamiento seguro en la nube y
                            control de acceso restringido.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            8. Derechos ARCO
                        </h2>
                        <p>
                            De conformidad con la LFPDPPP, tienes derecho a Acceder,
                            Rectificar, Cancelar u Oponerte (derechos ARCO) al tratamiento de
                            tus datos personales. Para ejercer cualquiera de estos derechos,
                            envía un correo electrónico a{" "}
                            <a
                                href="mailto:eventos@elromeral.mx"
                                className="text-primary underline underline-offset-2"
                            >
                                eventos@elromeral.mx
                            </a>{" "}
                            con el asunto {'"'}Derechos ARCO{'"'}, indicando tu nombre completo y
                            el derecho que deseas ejercer.
                        </p>
                        <p className="mt-2">
                            Responderemos a tu solicitud en un plazo máximo de 20 días
                            hábiles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            9. Retención de datos
                        </h2>
                        <p>
                            Conservamos tus datos personales únicamente durante el tiempo
                            necesario para cumplir con las finalidades descritas en esta
                            política, o según lo requiera la legislación aplicable. Una vez
                            que los datos dejen de ser necesarios, serán eliminados de forma
                            segura.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            10. Cambios a esta política
                        </h2>
                        <p>
                            Nos reservamos el derecho de actualizar esta Política de
                            Privacidad en cualquier momento. Cualquier cambio será publicado
                            en esta página con la fecha de última actualización. Te
                            recomendamos revisarla periódicamente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-3">
                            11. Contacto
                        </h2>
                        <p>
                            Si tienes dudas o comentarios sobre esta Política de Privacidad,
                            puedes contactarnos:
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
