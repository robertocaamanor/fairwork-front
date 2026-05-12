import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from './components/Header'
import { NewsBoard } from './components/NewsBoard'
import { RelatedNewsModal } from './components/news/RelatedNewsModal'
import { CategoryVisibilityModal } from './components/CategoryVisibilityModal'
import { GlobalSearchBoard } from './components/GlobalSearchBoard'
import { NEWS_CATEGORIES } from './types/news'
import type { NewsCategory, NewsFilter, NewsItem, NewsStatus } from './types/news'
import { api, getApiErrorMessage, sendNewsToN8n } from './services/api'

const CATEGORIES: NewsCategory[] = [...NEWS_CATEGORIES]

const buildCategoryRecord = <T,>(initializer: (category: NewsCategory) => T): Record<NewsCategory, T> => {
  return CATEGORIES.reduce<Record<NewsCategory, T>>((accumulator, category) => {
    accumulator[category] = initializer(category)
    return accumulator
  }, {} as Record<NewsCategory, T>)
}

const filterItems = (items: NewsItem[], filter: NewsFilter): NewsItem[] => {
  const sorted = [...items].sort((a, b) => {
    const first = new Date(a.publishedAt).getTime()
    const second = new Date(b.publishedAt).getTime()
    return second - first // Orden de más reciente a más antiguo
  })

  switch (filter) {
    case 'score70':
      return sorted.filter((item) => item.score >= 70)
    case 'new':
      return sorted.filter((item) => (item.status ?? 'new') === 'new')
    case 'selected':
      return sorted.filter((item) => item.status === 'selected')
    case 'discarded':
      return sorted.filter((item) => item.status === 'discarded')
    case 'all':
    default:
      return sorted
  }
}

function App() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'monitor' | 'search'>('monitor')
  const [filter, setFilter] = useState<NewsFilter>('all')
  const [relatedNewsTarget, setRelatedNewsTarget] = useState<NewsItem | null>(null)
  const [selectedNewsIds, setSelectedNewsIds] = useState<Set<string>>(new Set())
  const [visibleCategories, setVisibleCategories] = useState<Set<NewsCategory>>(new Set(CATEGORIES))
  const [categoryOrder, setCategoryOrder] = useState<NewsCategory[]>(CATEGORIES)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [searchByCategory, setSearchByCategory] = useState<Record<NewsCategory, string>>(
    buildCategoryRecord(() => ''),
  )
  const [debouncedSearchByCategory, setDebouncedSearchByCategory] = useState<Record<NewsCategory, string>>(
    buildCategoryRecord(() => ''),
  )
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const latestNewsQuery = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: api.getLatestNewsGrouped,
    refetchInterval: 60000,
    staleTime: 30000,
  })

  const toggleNewsSelection = useCallback((id: string) => {
    setSelectedNewsIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleCategoryVisibility = useCallback((category: NewsCategory) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const handleReorderCategory = useCallback((sourceCategory: NewsCategory, targetCategory: NewsCategory) => {
    setCategoryOrder((prev) => {
      const sourceIndex = prev.indexOf(sourceCategory)
      const targetIndex = prev.indexOf(targetCategory)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const next = [...prev]
      const [removed] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, removed)
      return next
    })
  }, [])

  const sendMultipleToN8nMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await api.sendNewsToN8n(id)
      }
    },
    onSuccess: () => {
      setErrorMessage(null)
      setMessage(`${selectedNewsIds.size} articulos enviados al n8n.`)
      setSelectedNewsIds(new Set())
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NewsStatus }) =>
      api.updateNewsStatus(id, { status }),
    onSuccess: async () => {
      setErrorMessage(null)
      setMessage('Estado actualizado correctamente.')
      await queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const runScrapeMutation = useMutation({
    mutationFn: api.triggerScraping,
    onSuccess: async (result) => {
      setErrorMessage(null)
      setMessage(result.message || 'Scraping ejecutado correctamente.')
      await queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const sendToN8nMutation = useMutation({
    mutationFn: (id: string) => sendNewsToN8n(id),
    onSuccess: (_result, id) => {
      setErrorMessage(null)
      setMessage('Articulo enviado para generar borrador.')

      queryClient.setQueriesData({ queryKey: ['news'] }, (oldData) => {
        if (Array.isArray(oldData)) {
          return oldData.map((item) =>
            item && typeof item === 'object' && 'id' in item && item.id === id
              ? { ...item, status: 'sent_to_n8n' }
              : item,
          )
        }

        if (oldData && typeof oldData === 'object') {
          const record = oldData as Record<string, unknown>
          const updated: Record<string, unknown> = { ...record }

          for (const [key, value] of Object.entries(record)) {
            if (Array.isArray(value)) {
              updated[key] = value.map((item) =>
                item && typeof item === 'object' && 'id' in item && item.id === id
                  ? { ...item, status: 'sent_to_n8n' }
                  : item,
              )
            }
          }

          return updated
        }

        return oldData
      })
    },
    onError: (error: unknown) => {
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  // Auto-scraping cada minuto
  useEffect(() => {
    const triggerAutoScraping = async () => {
      try {
        console.log('[Auto-Scraping] Ejecutando scraping automático...')
        const result = await api.triggerScraping()
        console.log('[Auto-Scraping] Completado:', result.message)
        await queryClient.invalidateQueries({ queryKey: ['news'] })
      } catch (error) {
        console.error('[Auto-Scraping] Error:', error)
      }
    }

    // Ejecutar scraping inicial después de 5 segundos
    const initialTimeout = setTimeout(() => {
      triggerAutoScraping()
    }, 5000)

    // Ejecutar scraping cada minuto
    const intervalId = setInterval(() => {
      triggerAutoScraping()
    }, 60000) // 60 segundos = 1 minuto

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [queryClient])

  const handleColumnSearchChange = useCallback((category: NewsCategory, value: string) => {
    setSearchByCategory((previous) => ({
      ...previous,
      [category]: value,
    }))
  }, [])

  const handleColumnSearchDebounced = useCallback((category: NewsCategory, value: string) => {
    setDebouncedSearchByCategory((previous) => ({
      ...previous,
      [category]: value,
    }))
  }, [])

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.16),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(190,24,93,0.14),transparent_45%)]" />

      <nav className="fixed inset-x-0 top-0 z-30 border-b border-zinc-700 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2 sm:px-6">
          <img src="/logo-tvenserio.svg" alt="TVenserio Logo" className="h-6 w-auto" />
        </div>
      </nav>

      <Header
        className="top-12"
        isOnline={!latestNewsQuery.isError}
        lastUpdated={latestNewsQuery.dataUpdatedAt ? new Date(latestNewsQuery.dataUpdatedAt) : undefined}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'monitor' ? (
        <NewsBoard
          categories={categoryOrder}
          filter={filter}
          updatingItemId={updateStatusMutation.isPending ? updateStatusMutation.variables?.id : undefined}
          onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
          onSendToN8n={(id) => sendToN8nMutation.mutateAsync(id)}
          sendingToN8nItemId={sendToN8nMutation.isPending ? sendToN8nMutation.variables : undefined}
          searchByCategory={searchByCategory}
          onSearchChange={handleColumnSearchChange}
          onSearchDebounced={handleColumnSearchDebounced}
          onOpenRelated={setRelatedNewsTarget}
          selectedNewsIds={selectedNewsIds}
          onToggleSelection={toggleNewsSelection}
          visibleCategories={visibleCategories}
          onReorderCategory={handleReorderCategory}
          topPaddingClass="pt-36 pb-24"
        />
      ) : (
        <GlobalSearchBoard
          filter={filter}
          updatingItemId={updateStatusMutation.isPending ? updateStatusMutation.variables?.id : undefined}
          onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
          onSendToN8n={(id) => sendToN8nMutation.mutateAsync(id)}
          sendingToN8nItemId={sendToN8nMutation.isPending ? sendToN8nMutation.variables : undefined}
          onOpenRelated={setRelatedNewsTarget}
          selectedNewsIds={selectedNewsIds}
          onToggleSelection={toggleNewsSelection}
        />
      )}

      {isCategoryModalOpen ? (
        <CategoryVisibilityModal
          visibleCategories={visibleCategories}
          onToggleCategory={toggleCategoryVisibility}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      ) : null}

      <RelatedNewsModal item={relatedNewsTarget} onClose={() => setRelatedNewsTarget(null)} />

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 px-4 flex flex-col gap-2">
        {selectedNewsIds.size > 0 ? (
          <div className="pointer-events-auto rounded-xl border border-cyan-500/40 bg-zinc-900/95 p-3 shadow-xl backdrop-blur flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-cyan-200">
              {selectedNewsIds.size} noticias seleccionadas
            </span>
            <button
              type="button"
              onClick={() => sendMultipleToN8nMutation.mutate(Array.from(selectedNewsIds))}
              disabled={sendMultipleToN8nMutation.isPending}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
            >
              {sendMultipleToN8nMutation.isPending ? 'Enviando...' : 'Enviar a n8n'}
            </button>
          </div>
        ) : null}

        {message ? (
          <div className="pointer-events-auto rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="pointer-events-auto rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
