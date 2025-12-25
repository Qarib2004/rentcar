import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useBookingDetails,
  useCancelBooking,
  useConfirmBooking,
  useCompleteBooking,
} from '@/features/bookings/hooks/useBookings'
import ReviewForm from '@/features/reviews/components/ReviewForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  MapPin,
  Car,
  CreditCard,
  Clock,
  ArrowLeft,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { formatPrice, resolveImageUrl } from '@/lib/utils'
import { ROUTES } from '@/lib/utils/constants'
import { useAuthStore } from '@/store/useAuthStore'
import { UserRole } from '@/types'

export function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { data: booking, isLoading } = useBookingDetails(id!)
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking()
  const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
  const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking()
  const { user } = useAuthStore()

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

  const isBookingOwner = booking?.userId === user?.id
  const isCarOwner = booking?.car?.owner?.id === user?.id
  const isAdmin = user?.role === UserRole.ADMIN

  const canCancel =
    booking &&
    ['PENDING', 'CONFIRMED'].includes(booking.status) &&
    (isBookingOwner || isCarOwner || isAdmin)
  
  const canReview = 
    booking && 
    booking.status === 'COMPLETED' && 
    !booking.review && 
    isBookingOwner
  
  const canActivate = 
    booking && 
    booking.status === 'CONFIRMED' && 
    (isCarOwner || isAdmin)
  
  const canComplete =
    booking &&
    (booking.status === 'ACTIVE' || booking.status === 'CONFIRMED') &&
    (isCarOwner || isAdmin)

  const handleCancelConfirm = () => {
    cancelBooking(id!, {
      onSuccess: () => {
        setShowCancelDialog(false)
      }
    })
  }

  const handleActivate = () => {
    confirmBooking(id!)
  }

  const handleComplete = () => {
    completeBooking(id!)
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (!booking) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Booking not found</h2>
            <Link to={ROUTES.BOOKINGS} className="mt-4 inline-block">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bookings
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to={ROUTES.BOOKINGS}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-500 mt-1">Booking ID: {booking.id.slice(0, 8)}</p>
            </div>
            <Badge variant={getStatusVariant(booking.status)} className="text-base px-4 py-2">
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Car Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {booking.car?.images?.[0] && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={resolveImageUrl(booking.car.images[0])}
                          alt={`${booking.car.brand} ${booking.car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.car?.brand} {booking.car?.model}
                      </h3>
                      <p className="text-gray-500">{booking.car?.year}</p>
                      <Link to={`/cars/${booking.car?.id}`} className="mt-2 inline-block">
                        <Button variant="link" className="px-0">
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pick-up Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.startDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Return Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.endDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Duration
                      </p>
                      <p className="font-medium">{booking.totalDays} days</p>
                    </div>
                  </div>

                  {booking.pickupLocation && (
                    <div>
                      <p className="text-sm text-gray-500">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Pick-up Location
                      </p>
                      <p className="font-medium">{booking.pickupLocation}</p>
                    </div>
                  )}

                  {booking.returnLocation && (
                    <div>
                      <p className="text-sm text-gray-500">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Return Location
                      </p>
                      <p className="font-medium">{booking.returnLocation}</p>
                    </div>
                  )}

                  {booking.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{booking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {canReview && (
                <div>
                  {!showReviewForm ? (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">How was your experience?</h3>
                          <p className="text-gray-600 mb-4">Share your review to help others</p>
                          <Button onClick={() => setShowReviewForm(true)}>
                            Write a Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <ReviewForm
                      bookingId={booking.id}
                      onSuccess={() => setShowReviewForm(false)}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Price Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {formatPrice(Number(booking.pricePerDay))} × {booking.totalDays} days
                    </span>
                    <span className="font-medium">
                      {formatPrice(Number(booking.totalPrice))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-medium">{formatPrice(Number(booking.deposit))}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-lg">
                      {formatPrice(Number(booking.totalPrice) + Number(booking.deposit))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {canActivate && (
                  <Button
                    className="w-full"
                    onClick={handleActivate}
                    disabled={isConfirming}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isConfirming ? 'Activating...' : 'Activate Booking'}
                  </Button>
                )}

                {canComplete && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleComplete}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Completing...' : 'Mark as Completed'}
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone and you may be subject to cancellation fees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              No, Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}