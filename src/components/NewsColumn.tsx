import { useEffect } from 'react'
import { CATEGORY_ACCENTS, CATEGORY_HEADER_ACCENTS, CATEGORY_LABELS } from '../constants/categories'
import type { NewsCategory, NewsItem } from '../types/news'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { NewsCard } from './NewsCard'
import { ColumnSearchInput } from './news/ColumnSearchInput'

interface NewsColumnProps {
  category: NewsCategory
  items: NewsItem[]
  isLoading: boolean
  error?: string
  onSendToN8n: (id: string) => Promise<unknown>
  sendingToN8nItemId?: string
  searchValue: string
  onSearchChange: (category: NewsCategory, value: string) => void
  onSearchDebounced: (category: NewsCategory, value: string) => void
  selectedNewsIds: Set<string>
  onToggleSelection: (id: string) => void
  onLoadMore?: () => void
  isFetchingNextPage?: boolean
  canSendToN8n: boolean
}

export function NewsColumn({
  category,
  items,
  isLoading,
  error,
  onSendToN8n,
  sendingToN8nItemId,
  searchValue,
  onSearchChange,
  onSearchDebounced,
  selectedNewsIds,
  onToggleSelection,
  onLoadMore,
  isFetchingNextPage,
  canSendToN8n,
}: NewsColumnProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onSearchDebounced(category, searchValue)
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [category, onSearchDebounced, searchValue])

  const label = CATEGORY_LABELS[category]

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore) return
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore()
    }
  }

  return (
    <section className="flex w-[340px] min-w-[340px] flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-3">
      <header className={`mb-3 rounded-xl bg-zinc-800 p-3 ${CATEGORY_ACCENTS[category]}`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={`text-sm font-semibold ${CATEGORY_HEADER_ACCENTS[category]}`}>
            {CATEGORY_LABELS[category]}
          </h2>
          <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
            {items.length}
          </span>
        </div>
      </header>

      <ColumnSearchInput
        value={searchValue}
        onChange={(value) => onSearchChange(category, value)}
        onClear={() => onSearchChange(category, '')}
        placeholder={`Buscar en ${label.toLowerCase()}...`}
      />

      <div 
        className="flex max-h-[calc(100vh-12rem)] flex-col gap-3 overflow-y-auto pr-1"
        onScroll={handleScroll}
      >
        {isLoading && items.length === 0 ? <LoadingState /> : null}

        {!isLoading && error ? (
          <EmptyState message={`No se pudo cargar esta categoria. ${error}`} />
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <EmptyState message="No hay noticias para este filtro." />
        ) : null}

        {!isLoading && !error
          ? items.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onSendToN8n={onSendToN8n}
                isSendingToN8n={sendingToN8nItemId === item.id}
                isSelected={selectedNewsIds.has(item.id)}
                onToggleSelect={() => onToggleSelection(item.id)}
                canSendToN8n={canSendToN8n}
              />
            ))
          : null}

        {isFetchingNextPage && items.length > 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-xs text-zinc-400 animate-pulse">Cargando mas noticias...</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
