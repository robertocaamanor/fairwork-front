import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import type { EditorialReview, EditorialReviewStatus } from '../../types/editorial'
import { getApiErrorMessage } from '../../services/api'
import {
  approveEditorialReview,
  getEditorialTopics,
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

export function EditorialWorkspace() {
  const queryClient = useQueryClient()
  const [section, setSection] = useState<EditorialSection>('reviews')
  const [status, setStatus] = useState<EditorialReviewStatus>('pending_review')
  const [selectedReview, setSelectedReview] = useState<EditorialReview | null>(null)
  const [rejectingReview, setRejectingReview] = useState<EditorialReview | null>(null)
  const [topicSearch, setTopicSearch] = useState('')
  const [topicId, setTopicId] = useState('')

  const reviewsQuery = useQuery({
    queryKey: ['editorial', 'reviews', status],
    queryFn: () => getEditorialReviews(status),
    enabled: section === 'reviews',
  })

  const topicsQuery = useQuery({
    queryKey: ['editorial', 'topics', topicSearch.trim()],
    queryFn: () => getEditorialTopics(topicSearch),
    refetchInterval: section === 'topics' ? 30000 : false,
    enabled: section === 'topics',
  })
  const firstTopic = topicsQuery.data?.find((topic) => topic.proposalCount > 0) ?? topicsQuery.data?.[0]
  const selectedTopicFromResults = topicsQuery.data?.find((topic) => topic.id === topicId)
  const activeTopicId = selectedTopicFromResults?.id || firstTopic?.id || ''

  const topicProposalsQuery = useQuery({
    queryKey: ['editorial', 'topics', activeTopicId, 'proposals'],
    queryFn: () => getTopicProposals(activeTopicId),
    enabled: section === 'topics' && activeTopicId.length > 0,
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
  const topicsError = topicsQuery.error ? getApiErrorMessage(topicsQuery.error) : undefined
  const mutationError = approveMutation.error ?? rejectMutation.error
  const reviewMutationError = mutationError ? getApiErrorMessage(mutationError) : undefined
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending
  const selectedTopic = topicsQuery.data?.find((topic) => topic.id === activeTopicId)

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
                topicsQuery.refetch()
              }}
            >
              <input
                value={topicSearch}
                onChange={(event) => {
                  setTopicSearch(event.target.value)
                  setTopicId('')
                }}
                placeholder="Buscar temática por título"
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
              <button
                type="button"
                onClick={() => topicsQuery.refetch()}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
                aria-label="Actualizar temáticas"
                title="Actualizar temáticas"
              >
                <RefreshCw size={16} />
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
          <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-zinc-700 bg-zinc-900 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">Temáticas</h2>
                <span className="text-xs text-zinc-500">{topicsQuery.data?.length ?? 0}</span>
              </div>

              {topicsQuery.isLoading ? (
                <p className="text-sm text-zinc-400">Cargando temáticas...</p>
              ) : topicsError ? (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {topicsError}
                </div>
              ) : (topicsQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-zinc-400">
                  {topicSearch.trim()
                    ? 'No hay temáticas con ese título.'
                    : 'No hay temáticas guardadas.'}
                </p>
              ) : (
                <div className="grid gap-2">
                  {(topicsQuery.data ?? []).map((topic) => {
                    const isSelected = topic.id === activeTopicId

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          setTopicId(topic.id)
                        }}
                        className={`rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? 'border-cyan-400/40 bg-cyan-400/10'
                            : 'border-zinc-700 bg-zinc-950/60 hover:bg-zinc-800'
                        }`}
                      >
                        <p className="line-clamp-2 text-sm font-medium text-zinc-100">{topic.theme}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-300">
                            {topic.category}
                          </span>
                          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-200">
                            {topic.proposalCount} propuestas
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </aside>

            <div className="grid gap-4">
              {selectedTopic ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">Tema seleccionado</p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-100">{selectedTopic.theme}</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selectedTopic.category} · {selectedTopic.tone}
                  </p>
                </div>
              ) : null}

              {activeTopicId.length === 0 ? (
                <EmptyState message="Selecciona una temática para ver propuestas." />
              ) : topicProposalsQuery.isLoading ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
                  Cargando propuestas editoriales...
                </div>
              ) : topicError ? (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {topicError}
                </div>
              ) : (topicProposalsQuery.data ?? []).length === 0 ? (
                <EmptyState message="No hay propuestas para esta temática." />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {(topicProposalsQuery.data ?? []).map((proposal) => (
                    <TopicProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {section === 'reviews' && !reviewsQuery.isLoading && (reviewsQuery.data ?? []).length === 0 ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-20 max-w-sm rounded-lg border border-cyan-500/30 bg-zinc-900/95 p-3 text-sm text-zinc-300 shadow-xl">
          Las propuestas generadas por IA aparecen en la pestaña <span className="text-cyan-200">Propuestas</span>.
        </div>
      ) : null}

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
