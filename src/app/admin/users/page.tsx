import { UsersContent } from "@/src/components/admin/users-content"
import { fetchProfiles, fetchServices } from "@/src/lib/supabase/queries"

export default async function UsersPage() {
  const profiles = await fetchProfiles()
  const services = await fetchServices()
  return <UsersContent initialUsers={profiles} services={services} />
}
