import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { useAllBookings, useConfirmBooking, useCancelBooking, useCompleteBooking } from '@/features/bookings/hooks/useBookings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { 
  Calendar as CalendarIcon, 
  Search, 
  MoreVertical, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Car,
  User,

} from 'lucide-react'
import { BookingStatus } from '@/types'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

export default function BookingsAdmin() {
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: 'confirm' | 'cancel' | 'complete' | null
    booking: { id: string; carName: string } | null
  }>({ open: false, type: null, booking: null })

  const { data: bookingsData, isLoading } = useAllBookings({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking()
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking()
  const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking()

  const handleActionClick = (
    type: 'confirm' | 'cancel' | 'complete',
    bookingId: string,
    carName: string
  ) => {
    setActionDialog({
      open: true,
      type,
      booking: { id: bookingId, carName },
    })
  }

  const handleConfirmAction = () => {
    if (!actionDialog.booking) return

    const { id } = actionDialog.booking

    switch (actionDialog.type) {
      case 'confirm':
        confirmBooking(id, {
          onSuccess: () => setActionDialog({ open: false, type: null, booking: null }),
        })
        break
      case 'cancel':
        cancelBooking(id, {
          onSuccess: () => setActionDialog({ open: false, type: null, booking: null }),
        })
        break
      case 'complete':
        completeBooking(id, {
          onSuccess: () => setActionDialog({ open: false, type: null, booking: null }),
        })
        break
    }
  }

  const handleCancelAction = () => {
    setActionDialog({ open: false, type: null, booking: null })
  }

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, icon: Clock, label: 'Pending' },
      CONFIRMED: { variant: 'success' as const, icon: CheckCircle, label: 'Confirmed' },
      ACTIVE: { variant: 'secondary' as const, icon: CalendarIcon, label: 'Active' },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      CANCELLED: { variant: 'danger' as const, icon: XCircle, label: 'Cancelled' },
      REJECTED: { variant: 'danger' as const, icon: XCircle, label: 'Rejected' },
    }
   
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const exportToCSV = () => {
    alert('Export functionality coming soon!')
  }

  const getActionDialogContent = () => {
    if (!actionDialog.type) return { title: '', description: '', buttonText: '', buttonColor: '' }

    const configs = {
      confirm: {
        title: 'Confirm Booking',
        description: `Are you sure you want to confirm the booking for ${actionDialog.booking?.carName}?`,
        buttonText: 'Confirm Booking',
        buttonColor: 'bg-green-600 hover:bg-green-700',
      },
      cancel: {
        title: 'Cancel Booking',
        description: `Are you sure you want to cancel the booking for ${actionDialog.booking?.carName}? This action cannot be undone.`,
        buttonText: 'Cancel Booking',
        buttonColor: 'bg-red-600 hover:bg-red-700',
      },
      complete: {
        title: 'Complete Booking',
        description: `Mark the booking for ${actionDialog.booking?.carName} as completed?`,
        buttonText: 'Complete Booking',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      },
    }

    return configs[actionDialog.type]
  }

  const dialogContent = getActionDialogContent()
  const isActionPending = isConfirming || isCancelling || isCompleting

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
            <p className="mt-2 text-gray-600">
              View and manage all bookings in the system
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by user, car, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={BookingStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={BookingStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Bookings List
              {bookingsData && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({bookingsData.data?.length || 0} results)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : bookingsData?.data && bookingsData.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking Info</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Car</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingsData.data.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                #{booking.id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {booking.user?.firstName} {booking.user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{booking.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {booking.car?.brand} {booking.car?.model}
                                </p>
                                <p className="text-xs text-gray-500">{booking.car?.year}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{format(new Date(booking.startDate), 'MMM dd')}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{format(new Date(booking.endDate), 'MMM dd')}</span>
                              </div>
                              <p className="text-xs text-gray-500">{booking.totalDays} days</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(Number(booking.totalPrice))}
                              </p>
                              <p className="text-xs text-gray-500">
                                +{formatPrice(Number(booking.deposit))} deposit
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/bookings/${booking.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {booking.status === BookingStatus.PENDING && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleActionClick(
                                        'confirm',
                                        booking.id,
                                        `${booking.car?.brand} ${booking.car?.model}`
                                      )
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                    Confirm Booking
                                  </DropdownMenuItem>
                                )}
                                {booking.status === BookingStatus.CONFIRMED && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleActionClick(
                                        'complete',
                                        booking.id,
                                        `${booking.car?.brand} ${booking.car?.model}`
                                      )
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                )}
                                {[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleActionClick(
                                          'cancel',
                                          booking.id,
                                          `${booking.car?.brand} ${booking.car?.model}`
                                        )
                                      }
                                      className="text-red-600 focus:text-red-700"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancel Booking
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">Showing page {page}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={bookingsData.data.length < limit}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={CalendarIcon}
                title="No bookings found"
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No bookings in the system yet'
                }
              />
            )}
          </CardContent>
        </Card>

        <AlertDialog open={actionDialog.open} onOpenChange={(open) => !open && handleCancelAction()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialogContent.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelAction} disabled={isActionPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                disabled={isActionPending}
                className={dialogContent.buttonColor}
              >
                {isActionPending ? 'Processing...' : dialogContent.buttonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}