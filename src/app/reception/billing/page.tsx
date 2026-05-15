import { BillingContent } from "@/src/components/reception/billing-content"
import { fetchInvoices, fetchPatients } from "@/src/lib/supabase/queries"

export default async function BillingPage() {
  const [invoices, patients] = await Promise.all([
    fetchInvoices(),
    fetchPatients(),
  ])

  return <BillingContent initialInvoices={invoices} patients={patients} />
}
