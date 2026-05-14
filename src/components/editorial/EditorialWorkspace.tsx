import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import type { EditorialReview, EditorialReviewStatus } from '../../types/editorial'
import { getApiErrorMessage } from '../../services/api'
import {
  approveEditorialReview,
  getEditorialReviews,
  getTopicProposals,
  rejectEditorialReview,
} from '../../services/editorialApi'
import { EmptyState } from '../EmptyState'
import { EditorialBoard } from './EditorialBoard'
import { EditorialContentModal } from './EditorialContentModal'
import { EditorialStatusTabs } from './EditorialStatusTabs'
import { RejectReviewModal } from './RejectReviewModal'
import { TopicProposalCard } from './TopicProposalCard'

type EditorialSection = 'reviews' | 'topics'

const normalizeTopicId = (value: string): string => value.trim()

export function EditorialWorkspace() {
  const queryClient = useQueryClient()
  const [section, setSection] = useState<EditorialSection>('reviews')
  const [status, setStatus] = useState<EditorialReviewStatus>('pending_review')
  const [selectedReview, setSelectedReview] = useState<EditorialReview | null>(null)
  const [rejectingReview, setRejectingReview] = useState<EditorialReview | null>(null)
  const [topicInput, setTopicInput] = useState('')
  const [topicId, setTopicId] = useState('')

  const reviewsQuery = useQuery({
    queryKey: ['editorial', 'reviews', status],
    queryFn: () => getEditorialReviews(status),
    enabled: section === 'reviews',
  })

  const topicProposalsQuery = useQuery({
    queryKey: ['editorial', 'topics', topicId, 'proposals'],
    queryFn: () => getTopicProposals(topicId),
    enabled: section === 'topics' && topicId.length > 0,
  })

  const approveMutation = useMutation({
    mutationFn: (review: EditorialReview) => approveEditorialReview(review.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['editorial', 'reviews'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ review, reason }: { review: EditorialReview; reason?: string }) =>
      rejectEditorialReview(review.id, reason),
    onSuccess: async () => {
      setRejectingReview(null)
      await queryClient.invalidateQueries({ queryKey: ['editorial', 'reviews'] })
    },
  })

  const reviewError = reviewsQuery.error ? getApiErrorMessage(reviewsQuery.error) : undefined
  const topicError = topicProposalsQuery.error ? getApiErrorMessage(topicProposalsQuery.error) : undefined
  const mutationError = approveMutation.error ?? rejectMutation.error
  const reviewMutationError = mutationError ? getApiErrorMessage(mutationError) : undefined
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending

  return (
    <main className="h-full overflow-y-auto px-4 pb-6 pt-36 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setSection('reviews')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                section === 'reviews'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Revisiones
            </button>
            <button
              type="button"
              onClick={() => setSection('topics')}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                section === 'topics'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Propuestas
            </button>
          </div>

          {section === 'reviews' ? (
            <EditorialStatusTabs value={status} onChange={setStatus} />
          ) : (
            <form
              className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-xl"
              onSubmit={(event) => {
                event.preventDefault()
                setTopicId(normalizeTopicId(topicInput))
              }}
            >
              <input
                value={topicInput}
                onChange={(event) => setTopicInput(event.target.value)}
                placeholder="topicId"
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/40 focus:ring"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                aria-label="Buscar propuestas"
                title="Buscar propuestas"
              >
                <Search size={16} />
              </button>
            </form>
          )}
        </div>

        {section === 'reviews' ? (
          <EditorialBoard
            reviews={reviewsQuery.data ?? []}
            isLoading={reviewsQuery.isLoading}
            error={reviewError ?? reviewMutationError}
            isSubmitting={isSubmitting}
            onApprove={(review) => approveMutation.mutate(review)}
            onReject={setRejectingReview}
            onViewContent={setSelectedReview}
            topPaddingClass="pt-0"
          />
        ) : (
          <section className="grid gap-4">
            {topicId.length === 0 ? (
              <EmptyState message="Ingresa un topicId para ver propuestas." />
            ) : topicProposalsQuery.isLoading ? (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                Cargando propuestas editoriales...
              </div>
            ) : topicError ? (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                {topicError}
              </div>
            ) : (topicProposalsQuery.data ?? []).length === 0 ? (
              <EmptyState message="No hay propuestas para este topicId." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {(topicProposalsQuery.data ?? []).map((proposal) => (
                  <TopicProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <EditorialContentModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      <RejectReviewModal
        review={rejectingReview}
        isSubmitting={rejectMutation.isPending}
        onCancel={() => setRejectingReview(null)}
        onConfirm={(reason) => {
          if (rejectingReview) {
            rejectMutation.mutate({ review: rejectingReview, reason })
          }
        }}
      />
    </main>
  )
}
