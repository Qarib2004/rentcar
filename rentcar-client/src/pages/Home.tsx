import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCars } from '@/features/cars/hooks/useCars'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Car,
  DollarSign,
  Shield,
  Clock,
  MapPin,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { formatPrice, resolveImageUrl } from '@/lib/utils'
import { ROUTES } from '@/lib/utils/constants'
import type { Car as CarType } from '@/types'

export default function Home() {
  const navigate = useNavigate()
  const { data: carsData, isLoading } = useCars({ page: 1, limit: 8 })

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <>
      
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect Ride
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing cars at unbeatable prices
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate(ROUTES.CARS)}
                className="text-lg"
              >
                Browse Cars
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register')}
                className="text-lg bg-white/10 hover:bg-white/20 text-white border-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Choose from hundreds of premium vehicles</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We're here to help you anytime</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
              <p className="text-gray-600">Safe and encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Cars</h2>
              <p className="text-gray-600 mt-2">Discover our top rental picks</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.CARS)}
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : carsData && carsData.data.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                  {carsData.data.map((car: CarType) => (
                    <div key={car.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%]">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate(`/cars/${car.slug}`)}>
                        <CardContent className="p-0">
                          <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                            {car.images && car.images.length > 0 ? (
                              <img
                                src={resolveImageUrl(car.images[0])}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <Badge
                              variant={car.status === 'AVAILABLE' ? 'success' : 'secondary'}
                              className="absolute top-2 right-2"
                            >
                              {car.status}
                            </Badge>
                          </div>

                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">{car.year}</p>

                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{car.seats}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{car.location}</span>
                              </div>
                            </div>

                            {car.averageRating > 0 && (
                              <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{car.averageRating.toFixed(1)}</span>
                                <span className="text-sm text-gray-500">({car.totalReviews})</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatPrice(Number(car.pricePerDay))}
                                </p>
                                <p className="text-xs text-gray-500">per day</p>
                              </div>
                              <Button size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No cars available at the moment</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and book your car today
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate(ROUTES.CARS)}
            className="text-lg"
          >
            Browse All Cars
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  )
}