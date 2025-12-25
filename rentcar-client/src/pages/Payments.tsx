import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import Header from '@/components/layout/Header'
import { useBookingDetails } from '@/features/bookings/hooks/useBookings'
import { useCreatePayment } from '@/features/payments/hooks/usePayments'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CreditCard,
  Calendar,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'



export default function Payment() {
  const { id: bookingId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const paymentStatus = searchParams.get('payment')
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: booking, isLoading } = useBookingDetails(bookingId!)
  const { mutate: createPayment, isPending } = useCreatePayment()

  useEffect(() => {
    if (paymentStatus === 'success') {
    }
  }, [paymentStatus])

  const handlePayment = async () => {
    if (!bookingId) return

    setIsProcessing(true)

    createPayment(
      {
        bookingId,
        successUrl: `${window.location.origin}/payment/${bookingId}?payment=success`,
        cancelUrl: `${window.location.origin}/payment/${bookingId}?payment=cancelled`,
      },
      {
    onSuccess: async (data) => {
        
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl
          return
         } else {
           console.error('Session URL is missing from payment response.')
         }
         setIsProcessing(false) 
 },
    }
    )
  }

  if (paymentStatus === 'success') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Your booking has been confirmed. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate(`/bookings/${bookingId}`)} className="w-full">
                  View Booking Details
                </Button>
                <Button variant="outline" onClick={() => navigate('/bookings')} className="w-full">
                  Go to My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (paymentStatus === 'cancelled') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled. You can try again or return to your bookings.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate(`/payment/${bookingId}`)} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/bookings')} className="w-full">
                  Go to My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!booking) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Booking not found</p>
              <Button onClick={() => navigate('/bookings')} className="mt-4">
                Go to My Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h1>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Review your rental information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    {booking.car!.images && booking.car!.images.length > 0 ? (
                      <img
                        src={booking.car!.images[0]}
                        alt={`${booking.car!.brand} ${booking.car!.model}`}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {booking.car!.brand} {booking.car!.model}
                      </h3>
                      <p className="text-sm text-gray-500">{booking.car!.year}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{booking.car!.transmission}</span>
                        <span>•</span>
                        <span>{booking.car!.fuelType}</span>
                        <span>•</span>
                        <span>{booking.car!.seats} seats</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Rental Period</p>
                        <p className="text-sm">
                          {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">{booking.totalDays} days</p>
                      </div>
                    </div>

                    {booking.pickupLocation && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Pickup Location</p>
                          <p className="text-sm">{booking.pickupLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Secure payment powered by Stripe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental ({booking.totalDays} days)</span>
                      <span className="font-medium">
                        {formatPrice(Number(booking.pricePerDay) * booking.totalDays)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deposit</span>
                      <span className="font-medium">{formatPrice(Number(booking.deposit))}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(Number(booking.totalPrice))}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isPending || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isPending || isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Stripe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Your payment is secured by Stripe. We never store your card details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}