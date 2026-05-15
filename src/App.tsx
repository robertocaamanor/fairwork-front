import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from './components/Header'
import { NewsBoard } from './components/NewsBoard'
import { RelatedNewsModal } from './components/news/RelatedNewsModal'
import { CategoryVisibilityModal } from './components/CategoryVisibilityModal'
import { GlobalSearchBoard } from './components/GlobalSearchBoard'
import { LoginScreen } from './components/LoginScreen'
import { EditorialWorkspace } from './components/editorial/EditorialWorkspace'
import { NEWS_CATEGORIES } from './types/news'
import type { NewsCategory, NewsFilter, NewsItem } from './types/news'
import type { AuthUser } from './types/auth'
import { api, authStorage, getApiErrorMessage } from './services/api'
import { DEFAULT_VISIBLE_CATEGORIES } from './constants/categories'

const CATEGORIES: NewsCategory[] = [...NEWS_CATEGORIES]
const AUTH_USER_STORAGE_KEY = 'fairwork-user'
const VISIBLE_CATEGORIES_STORAGE_KEY = 'fairwork-visible-categories'
type ViewMode = 'monitor' | 'search' | 'editorial'
const VIEW_MODE_TITLES: Record<ViewMode, string> = {
  monitor: 'Monitor',
  search: 'Busqueda',
  editorial: 'Editorial',
}

const buildCategoryRecord = <T,>(initializer: (category: NewsCategory) => T): Record<NewsCategory, T> => {
  return CATEGORIES.reduce<Record<NewsCategory, T>>((accumulator, category) => {
    accumulator[category] = initializer(category)
    return accumulator
  }, {} as Record<NewsCategory, T>)
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthUser
  } catch {
    return null
  }
}

const getStoredVisibleCategories = (): Set<NewsCategory> => {
  if (typeof window === 'undefined') {
    return DEFAULT_VISIBLE_CATEGORIES
  }

  const rawValue = window.localStorage.getItem(VISIBLE_CATEGORIES_STORAGE_KEY)

  if (!rawValue) {
    return DEFAULT_VISIBLE_CATEGORIES
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE_CATEGORIES
    const valid = (parsed as string[]).filter((c): c is NewsCategory =>
      (NEWS_CATEGORIES as readonly string[]).includes(c),
    )
    return valid.length > 0 ? new Set(valid) : DEFAULT_VISIBLE_CATEGORIES
  } catch {
    return DEFAULT_VISIBLE_CATEGORIES
  }
}

function App() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('monitor')
  const [filter] = useState<NewsFilter>('all')
  const [relatedNewsTarget, setRelatedNewsTarget] = useState<NewsItem | null>(null)
  const [selectedNewsIds, setSelectedNewsIds] = useState<Set<string>>(new Set())
  const [visibleCategories, setVisibleCategories] = useState<Set<NewsCategory>>(() => getStoredVisibleCategories())
  const [categoryOrder, setCategoryOrder] = useState<NewsCategory[]>(CATEGORIES)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [searchByCategory, setSearchByCategory] = useState<Record<NewsCategory, string>>(
    buildCategoryRecord(() => ''),
  )
  const [debouncedSearchByCategory, setDebouncedSearchByCategory] = useState<Record<NewsCategory, string>>(
    buildCategoryRecord(() => ''),
  )
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser())
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(null), 10000)
    return () => window.clearTimeout(t)
  }, [message])

  useEffect(() => {
    if (!errorMessage) return
    const t = window.setTimeout(() => setErrorMessage(null), 10000)
    return () => window.clearTimeout(t)
  }, [errorMessage])

  const latestNewsQuery = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: api.getLatestNewsGrouped,
    refetchInterval: 60000,
    staleTime: 30000,
    enabled: currentUser !== null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (currentUser) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(currentUser))
      return
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }, [currentUser])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      VISIBLE_CATEGORIES_STORAGE_KEY,
      JSON.stringify([...visibleCategories]),
    )
  }, [visibleCategories])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const windowName = currentUser ? VIEW_MODE_TITLES[viewMode] : 'Acceso'
    document.title = `Fairwork | ${windowName}`
  }, [currentUser, viewMode])

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
      return api.generateTopicProposals({
        newsIds: ids,
        tone: 'informativo',
        requestedProposals: 5,
      })
    },
    onSuccess: () => {
      setErrorMessage(null)
      setMessage(`${selectedNewsIds.size} articulos enviados a n8n en un solo lote.`)
      setSelectedNewsIds(new Set())
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const sendToN8nMutation = useMutation({
    mutationFn: (id: string) => api.sendNewsToN8n(id),
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

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.login(username, password),
    onSuccess: async (result) => {
      authStorage.setToken(result.accessToken)
      setCurrentUser(result.user)
      setErrorMessage(null)
      setMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['news'] })
    },
    onError: (error: unknown) => {
      authStorage.clearToken()
      setCurrentUser(null)
      setMessage(null)
      setErrorMessage(getApiErrorMessage(error))
    },
  })

  const handleLogout = useCallback(() => {
    authStorage.clearToken()
    setCurrentUser(null)
    setSelectedNewsIds(new Set())
    setRelatedNewsTarget(null)
    setMessage(null)
    setErrorMessage(null)
    queryClient.clear()
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

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={async ({ username, password }) => {
          await loginMutation.mutateAsync({ username, password })
        }}
        isSubmitting={loginMutation.isPending}
        errorMessage={errorMessage}
      />
    )
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {viewMode === 'monitor' ? (
        <NewsBoard
          categories={categoryOrder}
          filter={filter}
          onSendToN8n={(id) => sendToN8nMutation.mutateAsync(id)}
          sendingToN8nItemId={sendToN8nMutation.isPending ? sendToN8nMutation.variables : undefined}
          searchByCategory={searchByCategory}
          debouncedSearchByCategory={debouncedSearchByCategory}
          onSearchChange={handleColumnSearchChange}
          onSearchDebounced={handleColumnSearchDebounced}
          onOpenRelated={setRelatedNewsTarget}
          selectedNewsIds={selectedNewsIds}
          onToggleSelection={toggleNewsSelection}
          visibleCategories={visibleCategories}
          onReorderCategory={handleReorderCategory}
          topPaddingClass="pt-36 pb-24"
          canSendToN8n={currentUser.isAdmin || currentUser.canSendToN8n}
        />
      ) : viewMode === 'search' ? (
        <GlobalSearchBoard
          filter={filter}
          onSendToN8n={(id) => sendToN8nMutation.mutateAsync(id)}
          sendingToN8nItemId={sendToN8nMutation.isPending ? sendToN8nMutation.variables : undefined}
          onOpenRelated={setRelatedNewsTarget}
          selectedNewsIds={selectedNewsIds}
          onToggleSelection={toggleNewsSelection}
          canSendToN8n={currentUser.isAdmin || currentUser.canSendToN8n}
        />
      ) : (
        <EditorialWorkspace />
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
            {currentUser.isAdmin || currentUser.canSendToN8n ? (
              <button
                type="button"
                onClick={() => sendMultipleToN8nMutation.mutate(Array.from(selectedNewsIds))}
                disabled={sendMultipleToN8nMutation.isPending}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
              >
                {sendMultipleToN8nMutation.isPending ? 'Enviando...' : 'Enviar a n8n'}
              </button>
            ) : (
              <span className="text-xs text-zinc-400">Tu usuario no puede enviar a n8n.</span>
            )}
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
