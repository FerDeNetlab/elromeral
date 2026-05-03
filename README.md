# El Romeral

Jardín para bodas y eventos en Guadalajara.

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/UI (Radix)
- **Backend**: Supabase (Auth + Database)
- **Email**: Resend
- **Deployment**: Vercel

## Environment Variables

Configure these in your Vercel project settings:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Resend API key for emails |
| `ADMIN_SETUP_KEY` | Secret key for admin user creation |
| `NEXT_PUBLIC_SITE_URL` | Site URL (defaults to `https://elromeral.com.mx`) |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Verify token used in Meta webhook setup |
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token for WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID from Meta WhatsApp app |
| `WHATSAPP_APP_SECRET` | Meta App Secret for webhook signature validation |
| `WHATSAPP_GRAPH_VERSION` | Optional Graph version (default `v22.0`) |
| `WHATSAPP_NOTIFY_EMAIL` | Email to receive lead alerts from WhatsApp bot |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Sonnet (bot engine) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for Web Push notifications |
| `VAPID_PUBLIC_KEY` | VAPID public key (server-side) |
| `VAPID_PRIVATE_KEY` | VAPID private key (server-side, keep secret) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
