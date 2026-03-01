import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EditQuoteForm from "@/components/edit-quote-form"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditQuotePage({ params }: PageProps) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: quote, error } = await supabase.from("quotes").select("*").eq("slug", slug).maybeSingle()

  if (error || !quote) {
    notFound()
  }

  return <EditQuoteForm quote={quote} />
}
