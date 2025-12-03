import { Star, User } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { useCarReviews } from '../hooks/useReviews'
import { getInitials } from '@/lib/utils'
import type { Review } from '@/types'

interface ReviewsListProps {
  carId: string
}

export default function ReviewsList({ carId }: ReviewsListProps) {
  const { data: reviewsData, isLoading } = useCarReviews(carId)

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!reviewsData || reviewsData.data.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="Be the first to review this car!"
      />
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        Reviews ({reviewsData.total})
      </h3>

      {reviewsData.data.map((review: Review) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={review.user?.avatar} />
                <AvatarFallback>
                  {review.user
                    ? getInitials(`${review.user.firstName} ${review.user.lastName}`)
                    : <User className="w-5 h-5" />
                  }
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user?.firstName} {review.user?.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}