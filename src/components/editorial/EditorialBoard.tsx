import type { EditorialReview } from '../../types/editorial'
import { EmptyState } from '../EmptyState'
import { LoadingState } from '../LoadingState'
import { EditorialReviewCard } from './EditorialReviewCard'

interface EditorialBoardProps {
  reviews: EditorialReview[]
  isLoading: boolean
  error?: string
  isSubmitting: boolean
  onApprove: (review: EditorialReview) => void
  onReject: (review: EditorialReview) => void
  onViewContent: (review: EditorialReview) => void
  topPaddingClass?: string
}

export function EditorialBoard({
  reviews,
  isLoading,
  error,
  isSubmitting,
  onApprove,
  onReject,
  onViewContent,
  topPaddingClass = 'pt-28',
}: EditorialBoardProps) {
  if (isLoading) {
    return (
      <section className={`h-full overflow-y-auto px-4 pb-4 ${topPaddingClass} sm:px-6`}>
        <LoadingState message="Cargando revisiones editoriales..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className={`h-full overflow-y-auto px-4 pb-4 ${topPaddingClass} sm:px-6`}>
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      </section>
    )
  }

  if (reviews.length === 0) {
    return (
      <section className={`h-full overflow-y-auto px-4 pb-4 ${topPaddingClass} sm:px-6`}>
        <EmptyState message="No hay revisiones para este filtro." />
      </section>
    )
  }

  return (
    <section className={`h-full overflow-y-auto px-4 pb-4 ${topPaddingClass} sm:px-6`}>
      <div className="mx-auto grid max-w-[1100px] gap-4">
        {reviews.map((review) => (
          <EditorialReviewCard
            key={review.id}
            review={review}
            isSubmitting={isSubmitting}
            onApprove={onApprove}
            onReject={onReject}
            onViewContent={onViewContent}
          />
        ))}
      </div>
    </section>
  )
}
