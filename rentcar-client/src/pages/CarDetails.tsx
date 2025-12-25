import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useCarDetails } from '@/features/cars/hooks/useCars'
import { useCreateChatRoom } from '@/features/chat/hooks/useChat'
import BookingForm from '@/features/bookings/components/BookingForm'
import ReviewsList from '@/features/reviews/components/ReviewsList'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Users,
  Fuel,
  Settings,
  Gauge,
  Calendar,
  Star,
  ArrowLeft,
  Check,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import {  resolveImageUrl } from '@/lib/utils'
import { ROUTES } from '@/lib/utils/constants'
import { useAuthStore } from '@/store/useAuthStore'

export function CarDetails() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState(0)
  const { data: car, isLoading } = useCarDetails(slug!)
  const { mutate: createChatRoom, isPending: isCreatingChat } = useCreateChatRoom()
  const { user } = useAuthStore()

  const isOwner = user?.id === car?.ownerId

  console.log('=== CAR DETAILS DEBUG ===')
  console.log('ID from params:', slug)
  console.log('Full URL:', window.location.href)
  console.log('Pathname:', window.location.pathname)

  const handleContactOwner = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!car?.ownerId) return

    createChatRoom(
      { recipientId: car.ownerId },
      {
        onSuccess: (chatRoom) => {
          navigate('/chat')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (!car) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Car not found</h2>
            <Link to={ROUTES.CARS} className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cars
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to={ROUTES.CARS}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cars
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`space-y-6 ${isOwner ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <div className="relative h-96 rounded-lg overflow-hidden bg-gray-200">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={resolveImageUrl(car.images[selectedImage])}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {car.images && car.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {car.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-24 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={resolveImageUrl(image)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {car.brand} {car.model}
                      </h1>
                      <p className="text-gray-500">{car.year}</p>
                      {isOwner && (
                        <Badge variant="secondary" className="mt-2">
                          Your Car
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={car.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                        {car.status}
                      </Badge>
                      {!isOwner && user && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleContactOwner}
                          disabled={isCreatingChat}
                          title="Contact Owner"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {car.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{car.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">({car.totalReviews} reviews)</span>
                    </div>
                  )}

                  {car.owner && !isOwner && (
                    <Card className="mb-6 bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                              {car.owner.firstName?.[0]}{car.owner.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {car.owner.firstName} {car.owner.lastName}
                              </p>
                              <p className="text-sm text-gray-500">Car Owner</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleContactOwner}
                            disabled={isCreatingChat}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {isCreatingChat ? 'Loading...' : 'Message'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Seats</p>
                        <p className="font-medium">{car.seats}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium">{car.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Fuel className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Fuel Type</p>
                        <p className="font-medium">{car.fuelType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Gauge className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Mileage</p>
                        <p className="font-medium">{car.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{car.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">{car.year}</p>
                      </div>
                    </div>
                  </div>

                  {car.description && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{car.description}</p>
                    </div>
                  )}

                  {car.features && car.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {car.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {!isOwner && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <BookingForm car={car} />
                </div>
              </div>
            )}

            {isOwner && (
              <div className="lg:col-span-3 mt-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">
                          This is your car listing
                        </h3>
                        <p className="text-sm text-blue-700">
                          You cannot book your own car. Go to{' '}
                          <Link to="/my-cars" className="underline font-medium">
                            My Cars
                          </Link>{' '}
                          to manage this listing.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="mt-12">
            <ReviewsList carId={car.id} />
          </div>
        </div>
      </div>
    </>
  )
}