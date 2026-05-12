import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NewsColumn } from './NewsColumn'
import { api } from '../services/api'
import type { NewsCategory, NewsItem, NewsStatus, NewsFilter } from '../types/news'

interface NewsColumnContainerProps {
  category: NewsCategory
  filter: NewsFilter
  searchValue: string
  debouncedSearch: string
  onSearchChange: (category: NewsCategory, value: string) => void
  onSearchDebounced: (category: NewsCategory, value: string) => void
  updatingItemId?: string
  onStatusChange: (id: string, status: NewsStatus) => void
  onSendToN8n: (id: string) => Promise<void>
  sendingToN8nItemId?: string
  onOpenRelated: (item: NewsItem) => void
  selectedNewsIds: Set<string>
  onToggleSelection: (id: string) => void
}

export function NewsColumnContainer({
  category,
  filter,
  searchValue,
  debouncedSearch,
  onSearchChange,
  onSearchDebounced,
  updatingItemId,
  onStatusChange,
  onSendToN8n,
  sendingToN8nItemId,
  onOpenRelated,
  selectedNewsIds,
  onToggleSelection,
}: NewsColumnContainerProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['news', category, filter, debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      return api.getNewsByCategoryWithOffset(category, debouncedSearch, filter, pageParam)
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned items, we might have more.
      // We fetch 20 at a time.
      if (lastPage.length === 20) {
        return allPages.length * 20
      }
      return undefined
    },
    initialPageParam: 0,
    refetchInterval: 60000,
    staleTime: 15000,
  })

  const items = useMemo(() => {
    return data?.pages.flat() ?? []
  }, [data])

  const errorMessage = isError && error instanceof Error ? error.message : undefined

  return (
    <NewsColumn
      category={category}
      items={items}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      error={errorMessage}
      updatingItemId={updatingItemId}
      onStatusChange={onStatusChange}
      onSendToN8n={onSendToN8n}
      sendingToN8nItemId={sendingToN8nItemId}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchDebounced={onSearchDebounced}
      onOpenRelated={onOpenRelated}
      selectedNewsIds={selectedNewsIds}
      onToggleSelection={onToggleSelection}
      onLoadMore={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
    />
  )
}
