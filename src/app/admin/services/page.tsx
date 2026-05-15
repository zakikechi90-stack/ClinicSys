import { ServicesContent } from "@/src/components/admin/services-content"
import { fetchServices } from "@/src/lib/supabase/queries"

export default async function ServicesPage() {
  const services = await fetchServices()
  return <ServicesContent initialServices={services} />
}
