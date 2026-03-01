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

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
