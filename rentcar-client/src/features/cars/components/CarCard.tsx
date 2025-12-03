import { Link } from 'react-router-dom'
import { MapPin, Users, Fuel, Settings, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, resolveImageUrl } from '@/lib/utils'
import type { Car } from '@/types'

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success'
      case 'RENTED':
        return 'warning'
      case 'MAINTENANCE':
        return 'danger'
      case 'UNAVAILABLE':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {car.images && car.images.length > 0 ? (
          <img
            src={resolveImageUrl(car.images[0])}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge variant={getStatusColor(car.status)}>
            {car.status}
          </Badge>
        </div>

        {car.averageRating > 0 && (
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{car.averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({car.totalReviews})</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {car.brand} {car.model}
        </h3>
        <p className="text-sm text-gray-500">{car.year}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{car.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(Number(car.pricePerDay))}
          </p>
          <p className="text-sm text-gray-500">per day</p>
        </div>
        <Link to={`/cars/${car.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}