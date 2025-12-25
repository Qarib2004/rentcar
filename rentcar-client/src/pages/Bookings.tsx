import { Link, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useMyBookings } from '@/features/bookings/hooks/useBookings'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Calendar, Car, MapPin, Clock } from 'lucide-react'
import { formatPrice, resolveImageUrl } from '@/lib/utils'
import { format } from 'date-fns'
import type { Booking } from '@/types'
import { ROUTES } from '@/lib/utils/constants'

export function Bookings() {
  const { data: bookingsData, isLoading } = useMyBookings()
  const navigate = useNavigate()

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'ACTIVE':
        return 'default'
      case 'COMPLETED':
        return 'secondary'
      case 'CANCELLED':
      case 'REJECTED':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">View and manage your car bookings</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookingsData && bookingsData.data.length > 0 ? (
            <div className="space-y-4">
              {bookingsData.data.map((booking: Booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex gap-4">
                        {booking.car?.images?.[0] && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={resolveImageUrl(booking.car.images[0])}
                              alt={`${booking.car.brand} ${booking.car.model}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.car?.brand} {booking.car?.model}
                              </h3>
                              <p className="text-sm text-gray-500">{booking.car?.year}</p>
                            </div>
                            <Badge variant={getStatusVariant(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                                {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.totalDays} days</span>
                            </div>
                            {booking.pickupLocation && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{booking.pickupLocation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(Number(booking.totalPrice))}
                          </p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                        <Link to={`/bookings/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Car}
              title="No bookings yet"
              description="Start exploring our cars and make your first booking!"
              actionLabel="Browse Cars"
              onAction={() => navigate(ROUTES.CARS)}
            />
          )}
        </div>
      </div>
    </>
  )
}