import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import { useMyCars, useUpdateCarStatus, useDeleteCar } from '@/features/cars/hooks/useCars'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import {
  Car as CarIcon,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Settings as SettingsIcon,
} from 'lucide-react'
import { formatPrice, resolveImageUrl } from '@/lib/utils'
import type { Car } from '@/types'

export default function MyCars() {
  const [page, setPage] = useState(1)
  const { data: carsData, isLoading } = useMyCars(page, 10)
  const { mutate: updateStatus } = useUpdateCarStatus('')
  const { mutate: deleteCar } = useDeleteCar()
  const navigate = useNavigate()

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

  const handleStatusChange = (carId: string, newStatus: string) => {
    if (window.confirm(`Change car status to ${newStatus}?`)) {
      updateStatus(newStatus)
    }
  }

  const handleDelete = (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      deleteCar(carId)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Cars</h1>
              <p className="text-gray-600 mt-2">Manage your car listings</p>
            </div>
            <Link to="/cars/create">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add New Car
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : carsData && carsData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6">
                {carsData.data.map((car: Car) => (
                  <Card key={car.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Car Image */}
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                          {car.images && car.images.length > 0 ? (
                            <img
                              src={resolveImageUrl(car.images[0])}
                              alt={`${car.brand} ${car.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <CarIcon className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {car.brand} {car.model}
                              </h3>
                              <p className="text-gray-500">{car.year}</p>
                            </div>
                            <Badge variant={getStatusColor(car.status)}>
                              {car.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Price/Day</p>
                              <p className="font-semibold">{formatPrice(Number(car.pricePerDay))}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-semibold">{car.location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Rating</p>
                              <p className="font-semibold">⭐ {car.averageRating.toFixed(1)} ({car.totalReviews})</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bookings</p>
                              <p className="font-semibold">{car.totalReviews || 0}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link to={`/cars/${car.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                            <Link to={`/cars/${car.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <div className="relative group">
                              <Button variant="outline" size="sm">
                                <SettingsIcon className="w-4 h-4 mr-2" />
                                Status
                              </Button>
                              <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[150px]">
                                {['AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(car.id, status)}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(car.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {carsData.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {carsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === carsData.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={CarIcon}
              title="No cars yet"
              description="Start by adding your first car to the platform"
              actionLabel="Add Car"
              onAction={() => navigate('/cars/create')}
            />
          )}
        </div>
      </div>
    </>
  )
}