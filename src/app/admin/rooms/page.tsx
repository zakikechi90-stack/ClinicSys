import { RoomsContent } from "@/src/components/admin/rooms-content"
import { fetchRoomsWithBeds, fetchServices } from "@/src/lib/supabase/queries"

export default async function RoomsPage() {
  const [rooms, services] = await Promise.all([fetchRoomsWithBeds(), fetchServices()])
  return <RoomsContent initialRooms={rooms} services={services} />
}
