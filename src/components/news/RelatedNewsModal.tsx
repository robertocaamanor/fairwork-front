import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Search } from 'lucide-react'
import { api, getApiErrorMessage } from '../../services/api'
import type { NewsItem } from '../../types/news'

interface RelatedNewsModalProps {
  item: NewsItem | null
  onClose: () => void
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Fecha desconocida'
  }

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function RelatedNewsModal({ item, onClose }: RelatedNewsModalProps) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    setSearchInput('')
    setDebouncedSearch('')
  }, [item?.id])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const query = useQuery({
    queryKey: ['news', 'related', item?.id, debouncedSearch, item?.category, item?.sourceName],
    queryFn: async () => {
      if (!item) {
        return []
      }

      if (debouncedSearch.length > 0) {
        return api.searchRelatedNews(debouncedSearch, item.category, item.sourceName)
      }

      return api.getRelatedNewsById(item.id)
    },
    enabled: Boolean(item),
    refetchInterval: item ? 60000 : false,
    staleTime: 30000,
  })

  const errorMessage = useMemo(() => {
    if (!query.error) {
      return undefined
    }

    return getApiErrorMessage(query.error)
  }, [query.error])

  if (!item) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Noticias relacionadas</p>
            <h3 className="text-lg font-semibold text-zinc-100">{item.title}</h3>
            <p className="text-xs text-zinc-400">
              {item.sourceName} • {item.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            Cerrar
          </button>
        </div>

        <div className="mb-4">
          <label className="relative block">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar relacionadas..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none ring-cyan-400/40 placeholder:text-zinc-500 focus:ring"
            />
          </label>
        </div>

        {query.isLoading ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-4 text-sm text-zinc-300">
            Cargando noticias relacionadas...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        {!query.isLoading && !errorMessage && (query.data?.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-4 text-sm text-zinc-300">
            No se encontraron noticias relacionadas.
          </div>
        ) : null}

        {!query.isLoading && !errorMessage && (query.data?.length ?? 0) > 0 ? (
          <div className="space-y-3">
            {query.data?.map((related) => (
              <article key={related.id} className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-zinc-100">{related.title}</h4>
                  <span className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                    score {related.score}
                  </span>
                </div>

                <p className="mb-2 text-xs text-zinc-400">
                  {related.sourceName} • {related.category} • {formatDate(related.publishedAt)}
                </p>
                <p className="mb-3 text-sm text-zinc-300">{related.summary}</p>

                <a
                  href={related.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                >
                  <ExternalLink size={13} /> Abrir fuente
                </a>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
