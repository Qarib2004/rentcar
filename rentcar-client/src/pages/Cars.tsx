import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useCars, useCategories } from '@/features/cars/hooks/useCars'
import CarCard from '@/features/cars/components/CarCard'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Car as CarIcon, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CarsQueryParams } from '@/types/api.types'
import { Helmet } from 'react-helmet-async'

export function Cars() {
  const [filters, setFilters] = useState<CarsQueryParams>({
    page: 1,
    limit: 12,
  })
  
  const { data: carsData, isLoading } = useCars(filters)
  const { data: categories } = useCategories()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))
  }

  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
      page: 1,
    }))
  }

  return (
    <>
      <Helmet>
        <title>Cars - RentCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Available Cars</h1>
            <p className="mt-2 text-gray-600">
              Find the perfect car for your journey
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search by brand, model..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                className="max-w-md"
              />
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.categoryId === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : carsData && carsData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {carsData.data.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {carsData.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {filters.page} of {carsData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={filters.page === carsData.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={CarIcon}
              title="No cars found"
              description="Try adjusting your filters to find more cars"
            />
          )}
        </div>
      </div>
    </>
  )
}