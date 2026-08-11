import { useQuery } from '@tanstack/react-query'
import { LocationService, Neighborhood } from '@/services/location-service'

export function useNeighborhoods() {
  const { data, isLoading } = useQuery({
    queryKey: ['neighborhoods'],
    queryFn: LocationService.getNeighborhoods,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })

  const neighborhoods: Neighborhood[] = data?.data?.neighborhoods || []

  return { neighborhoods, isLoading }
}
