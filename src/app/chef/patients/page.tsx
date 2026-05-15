import { ChefPatientsContent } from "@/src/components/chef/chef-patients-content"
import { fetchPatientsWithDoctor } from "@/src/lib/supabase/queries"

export default async function ChefPatientsPage() {
  const patients = await fetchPatientsWithDoctor()
  return <ChefPatientsContent initialPatients={patients} />
}
