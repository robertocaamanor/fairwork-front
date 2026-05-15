import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Search } from 'lucide-react'
import type { EditorialTopicProposal } from '../../types/editorial'
import { getApiErrorMessage } from '../../services/api'
import {
  getEditorialTopics,
  getTopicProposals,
  sendTopicProposalToWordpressDraft,
} from '../../services/editorialApi'
import { EmptyState } from '../EmptyState'
import { TopicProposalDetailPanel } from './TopicProposalDetailPanel'

export function EditorialWorkspace() {
  const queryClient = useQueryClient()
  const [topicSearch, setTopicSearch] = useState('')
  const [topicId, setTopicId] = useState('')
  const [selectedTopicProposalId, setSelectedTopicProposalId] = useState<number | null>(null)

  const topicsQuery = useQuery({
    queryKey: ['editorial', 'topics', topicSearch.trim()],
    queryFn: () => getEditorialTopics(topicSearch),
    refetchInterval: 30000,
  })
  const firstTopic = topicsQuery.data?.find((topic) => topic.proposalCount > 0) ?? topicsQuery.data?.[0]
  const selectedTopicFromResults = topicsQuery.data?.find((topic) => topic.id === topicId)
  const activeTopicId = selectedTopicFromResults?.id || firstTopic?.id || ''

  const topicProposalsQuery = useQuery({
    queryKey: ['editorial', 'topics', activeTopicId, 'proposals'],
    queryFn: () => getTopicProposals(activeTopicId),
    enabled: activeTopicId.length > 0,
  })

  const sendTopicProposalMutation = useMutation({
    mutationFn: (proposal: EditorialTopicProposal) =>
      sendTopicProposalToWordpressDraft(proposal.topicId, proposal.id),
    onSuccess: async (proposal) => {
      setSelectedTopicProposalId(proposal.id)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['editorial', 'topics'] }),
        queryClient.invalidateQueries({ queryKey: ['editorial', 'topics', proposal.topicId, 'proposals'] }),
      ])
    },
  })
  const topicError = topicProposalsQuery.error ? getApiErrorMessage(topicProposalsQuery.error) : undefined
  const topicsError = topicsQuery.error ? getApiErrorMessage(topicsQuery.error) : undefined
  const sendTopicProposalError = sendTopicProposalMutation.error
    ? getApiErrorMessage(sendTopicProposalMutation.error)
    : undefined
  const selectedTopic = topicsQuery.data?.find((topic) => topic.id === activeTopicId)

  return (
    <main className="h-full overflow-y-auto px-4 pb-6 pt-36 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-zinc-100">Propuestas</h1>

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
                setSelectedTopicProposalId(null)
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
        </div>

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
                        setSelectedTopicProposalId(null)
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
              <TopicProposalDetailPanel
                proposals={topicProposalsQuery.data ?? []}
                selectedProposalId={selectedTopicProposalId}
                isSending={sendTopicProposalMutation.isPending}
                sendError={sendTopicProposalError}
                onSelectProposal={setSelectedTopicProposalId}
                onSendToWordpress={(proposal) => sendTopicProposalMutation.mutate(proposal)}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
