import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { useCars, useDeleteCar, useUpdateCarStatus } from '@/features/cars/hooks/useCars'
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
  Car, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench
} from 'lucide-react'
import { CarStatus} from '@/types'
import { formatPrice } from '@/lib/utils'

export default function CarsAdmin() {
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CarStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [carToDelete, setCarToDelete] = useState<{ id: string; name: string } | null>(null)

  const { data: carsData, isLoading } = useCars({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const { mutate: deleteCar, isPending: isDeleting } = useDeleteCar()
  const { mutate: updateStatus } = useUpdateCarStatus()

  const handleDeleteClick = (carId: string, carName: string) => {
    setCarToDelete({ id: carId, name: carName })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (carToDelete) {
      deleteCar(carToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setCarToDelete(null)
        },
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setCarToDelete(null)
  }

  const handleStatusChange = (carId: string, newStatus: CarStatus) => {
    updateStatus({ carId, status: newStatus })
  }

  const getStatusBadge = (status: CarStatus) => {
    const statusConfig = {
      AVAILABLE: { variant: 'success' as const, icon: CheckCircle, label: 'Available' },
      RENTED: { variant: 'warning' as const, icon: AlertCircle, label: 'Rented' },
      MAINTENANCE: { variant: 'secondary' as const, icon: Wrench, label: 'Maintenance' },
      UNAVAILABLE: { variant: 'danger' as const, icon: XCircle, label: 'Unavailable' },
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Cars</h1>
            <p className="mt-2 text-gray-600">
              View and manage all cars in the system
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate('/create-car')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Car
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by brand, model, or license plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as CarStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={CarStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={CarStatus.RENTED}>Rented</SelectItem>
                  <SelectItem value={CarStatus.MAINTENANCE}>Maintenance</SelectItem>
                  <SelectItem value={CarStatus.UNAVAILABLE}>Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Cars List
              {carsData && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({carsData.data?.length || 0} results)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : carsData?.data && carsData.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Car</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Price/Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Specs</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carsData.data.map((car) => (
                        <TableRow key={car.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {car.images && car.images.length > 0 ? (
                                <img
                                  src={car.images[0]}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Car className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {car.brand} {car.model}
                                </p>
                                <p className="text-sm text-gray-500">{car.year}</p>
                                <p className="text-xs text-gray-400">{car.licensePlate}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {car.owner?.firstName} {car.owner?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{car.owner?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-gray-900">
                              {formatPrice(Number(car.pricePerDay))}
                            </p>
                            {car.pricePerHour && (
                              <p className="text-xs text-gray-500">
                                {formatPrice(Number(car.pricePerHour))}/hr
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(car.status)}</TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-900">{car.location}</p>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>{car.transmission}</p>
                              <p>{car.fuelType}</p>
                              <p>{car.seats} seats • {car.doors} doors</p>
                            </div>
                          </TableCell>
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
                                <DropdownMenuItem onClick={() => navigate(`/cars/${car.slug}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/cars/${car.id}/edit`)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Car
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                                  Change Status
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(car.id, CarStatus.AVAILABLE)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  Set Available
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(car.id, CarStatus.MAINTENANCE)}
                                >
                                  <Wrench className="w-4 h-4 mr-2 text-orange-600" />
                                  Set Maintenance
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(car.id, CarStatus.UNAVAILABLE)}
                                >
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                  Set Unavailable
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(car.id, `${car.brand} ${car.model}`)}
                                  className="text-red-600 focus:text-red-700"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Car
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing page {page}
                  </p>
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
                      disabled={carsData.data.length < limit}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Car}
                title="No cars found"
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first car to get started'
                }
              />
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{' '}
                <span className="font-semibold text-gray-900">{carToDelete?.name}</span> and remove
                all associated data from the system. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete Car'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}