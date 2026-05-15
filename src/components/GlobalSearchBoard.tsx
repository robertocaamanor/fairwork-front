import { useEffect, useMemo, useState, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search, Filter } from 'lucide-react'
import { api } from '../services/api'
import { NewsCard } from './NewsCard'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import type { NewsFilter } from '../types/news'

interface GlobalSearchBoardProps {
  filter: NewsFilter
  onSendToN8n: (id: string) => Promise<unknown>
  sendingToN8nItemId?: string
  selectedNewsIds: Set<string>
  onToggleSelection: (id: string) => void
  canSendToN8n: boolean
}

export function GlobalSearchBoard({
  filter,
  onSendToN8n,
  sendingToN8nItemId,
  selectedNewsIds,
  onToggleSelection,
  canSendToN8n,
}: GlobalSearchBoardProps) {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [debouncedSource, setDebouncedSource] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setDebouncedSource(source.trim())
    }, 500)
    return () => clearTimeout(timeout)
  }, [query, source])

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['news', 'global-search', debouncedQuery, debouncedSource, filter],
    queryFn: async ({ pageParam = 0 }) => {
      return api.searchGlobalNews(debouncedQuery, debouncedSource, filter, pageParam)
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 20) {
        return allPages.length * 20
      }
      return undefined
    },
    initialPageParam: 0,
    staleTime: 15000,
    enabled: debouncedQuery.length > 0 || debouncedSource.length > 0,
  })

  const hasSearchQuery = debouncedQuery.length > 0 || debouncedSource.length > 0

  const items = useMemo(() => {
    return data?.pages.flat() ?? []
  }, [data])

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    if (scrollHeight - scrollTop - clientHeight < 200) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }
  }

  return (
    <main className={`flex h-full flex-col px-4 pb-4 sm:px-6 transition-all duration-500 ease-in-out ${hasSearchQuery ? 'pt-36' : 'pt-[30vh]'}`}>
      <div className={`mx-auto flex w-full flex-col gap-4 sm:flex-row transition-all duration-500 ease-in-out ${hasSearchQuery ? 'max-w-none mb-6' : 'max-w-3xl'}`}>
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-all ${hasSearchQuery ? 'h-5 w-5' : 'h-6 w-6'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por palabra clave en cualquier categoria..."
            className={`w-full rounded-2xl border border-zinc-700 bg-zinc-900/50 text-white placeholder-zinc-500 backdrop-blur transition-all focus:border-cyan-500 focus:bg-zinc-900 focus:outline-none ${hasSearchQuery ? 'py-3 pl-11 pr-4 text-base' : 'py-4 pl-14 pr-6 text-lg shadow-2xl'}`}
          />
        </div>
        <div className={`relative w-full transition-all ${hasSearchQuery ? 'sm:w-72' : 'sm:w-1/3'}`}>
          <Filter className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-all ${hasSearchQuery ? 'h-5 w-5' : 'h-6 w-6'}`} />
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Filtrar fuente..."
            className={`w-full rounded-2xl border border-zinc-700 bg-zinc-900/50 text-white placeholder-zinc-500 backdrop-blur transition-all focus:border-cyan-500 focus:bg-zinc-900 focus:outline-none ${hasSearchQuery ? 'py-3 pl-11 pr-4 text-base' : 'py-4 pl-14 pr-6 text-lg shadow-2xl'}`}
          />
        </div>
      </div>

      {!hasSearchQuery && (
        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center text-center text-zinc-500 animate-in fade-in zoom-in duration-500">
          <Search className="mb-4 h-16 w-16 opacity-20" />
          <h2 className="text-xl font-medium text-zinc-400">Búsqueda Global Fairwork</h2>
          <p className="mt-2">Escribe cualquier palabra clave o fuente para buscar en toda la base de datos simultáneamente. Los resultados aparecerán al instante.</p>
        </div>
      )}

      {hasSearchQuery && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto pr-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {isLoading && items.length === 0 ? (
            <div className="mt-12"><LoadingState /></div>
          ) : null}

          {!isLoading && isError ? (
            <EmptyState message={`No se pudo realizar la busqueda. ${error instanceof Error ? error.message : ''}`} />
          ) : null}

          {!isLoading && !isError && items.length === 0 ? (
            <div className="mt-12"><EmptyState message="No se encontraron resultados para tu busqueda." /></div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onSendToN8n={onSendToN8n}
                isSendingToN8n={sendingToN8nItemId === item.id}
                isSelected={selectedNewsIds.has(item.id)}
                onToggleSelect={() => onToggleSelection(item.id)}
                canSendToN8n={canSendToN8n}
              />
            ))}
          </div>

          {isFetchingNextPage && items.length > 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm font-medium text-cyan-500 animate-pulse">Cargando mas resultados...</span>
            </div>
          ) : null}
        </div>
      )}
    </main>
  )
}
