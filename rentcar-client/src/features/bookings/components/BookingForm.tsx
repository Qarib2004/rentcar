import { useState, useEffect } from 'react'
import { format, differenceInDays, addDays } from 'date-fns'
import { Calendar, MapPin, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateBooking, useCheckAvailability } from '../hooks/useBookings'
import { formatPrice } from '@/lib/utils'
import type { Car } from '@/types'

interface BookingFormProps {
  car: Car
}

export default function BookingForm({ car }: BookingFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [pickupLocation, setPickupLocation] = useState(car.location)
  const [returnLocation, setReturnLocation] = useState(car.location)

  const { mutate: createBooking, isPending } = useCreateBooking()
  const { data: availability } = useCheckAvailability(car.id, startDate, endDate)

  const totalDays = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) : 0
  const totalPrice = totalDays > 0 ? Number(car.pricePerDay) * totalDays : 0
  const deposit = Number(car.deposit)

  useEffect(() => {
    const tomorrow = addDays(new Date(), 1)
    const minDate = format(tomorrow, "yyyy-MM-dd'T'HH:mm")
    
    if (!startDate) {
      setStartDate(minDate)
    }
    if (!endDate) {
      setEndDate(format(addDays(tomorrow, 1), "yyyy-MM-dd'T'HH:mm"))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!availability?.isAvailable) {
      return
    }

    createBooking({
      carId: car.id,
      startDate,
      endDate,
      notes,
      pickupLocation,
      returnLocation,
    })
  }

  const isAvailable = availability?.isAvailable !== false
  const canSubmit = startDate && endDate && totalDays > 0 && isAvailable && !isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Car</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                <Calendar className="w-4 h-4 inline mr-1" />
                Pick-up Date
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm")}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                <Calendar className="w-4 h-4 inline mr-1" />
                Return Date
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm")}
                required
              />
            </div>
          </div>

          {startDate && endDate && totalDays > 0 && (
            <div>
              {!isAvailable ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Car is not available for selected dates</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Car is available!</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupLocation">
                <MapPin className="w-4 h-4 inline mr-1" />
                Pick-up Location
              </Label>
              <Input
                id="pickupLocation"
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pick-up location"
              />
            </div>
            <div>
              <Label htmlFor="returnLocation">
                <MapPin className="w-4 h-4 inline mr-1" />
                Return Location
              </Label>
              <Input
                id="returnLocation"
                type="text"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                placeholder="Enter return location"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or information..."
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
          </div>

          {totalDays > 0 && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatPrice(Number(car.pricePerDay))} × {totalDays} days
                </span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit</span>
                <span className="font-medium">{formatPrice(deposit)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatPrice(totalPrice + deposit)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Deposit will be refunded after returning the car in good condition
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!canSubmit}
            isLoading={isPending}
          >
            {isPending ? 'Processing...' : 'Confirm Booking'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Free cancellation up to 24 hours before pick-up
          </p>
        </form>
      </CardContent>
    </Card>
  )
}