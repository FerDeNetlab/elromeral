#!/usr/bin/env node
// Uso: node scripts/reset-wa-lead.mjs +521234567890
// Resetea el estado del lead de WhatsApp para poder probar el funnel desde cero

import { createClient } from "@supabase/supabase-js"

const phone = process.argv[2]

if (!phone) {
  console.error("❌  Uso: node scripts/reset-wa-lead.mjs <telefono>")
  console.error("   Ejemplo: node scripts/reset-wa-lead.mjs 521336821088")
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("❌  Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const sb = createClient(url, key)

// Borrar mensajes
const { error: msgErr } = await sb
  .from("whatsapp_messages")
  .delete()
  .eq("phone", phone)

if (msgErr) console.warn("⚠️  Error borrando mensajes:", msgErr.message)
else console.log("✓  Mensajes eliminados")

// Borrar lead
const { data, error: leadErr } = await sb
  .from("quotes")
  .delete()
  .eq("telefono", phone)
  .eq("source", "whatsapp")
  .select("id, nombres")

if (leadErr) console.warn("⚠️  Error borrando lead:", leadErr.message)
else if (!data || data.length === 0) console.log("ℹ️  No se encontró lead con ese teléfono")
else console.log(`✓  Lead eliminado: ${data[0].nombres} (${data[0].id})`)

console.log(`\n✅ Teléfono ${phone} listo para probar desde cero.`)
