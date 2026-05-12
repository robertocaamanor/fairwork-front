import { ExternalLink, Link2, Send } from 'lucide-react'
import type { NewsItem } from '../types/news'

interface NewsCardProps {
  item: NewsItem
  onSendToN8n: (id: string) => Promise<unknown>
  onOpenRelated: (item: NewsItem) => void
  isSendingToN8n: boolean
  isSelected: boolean
  onToggleSelect: () => void
  canSendToN8n: boolean
}

const statusStyles: Record<string, string> = {
  new: 'text-zinc-300 border-zinc-600 bg-zinc-700/40',
  selected: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
  discarded: 'text-rose-300 border-rose-500/40 bg-rose-500/10',
  sent_to_n8n: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
}

const statusLabels: Record<string, string> = {
  new: 'Nueva',
  selected: 'Seleccionada',
  discarded: 'Descartada',
  sent_to_n8n: 'Enviado a n8n',
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

export function NewsCard({
  item,
  onSendToN8n,
  onOpenRelated,
  isSendingToN8n,
  isSelected,
  onToggleSelect,
  canSendToN8n,
}: NewsCardProps) {
  const currentStatus = item.status ?? 'new'

  const handleGenerate = async () => {
    console.log('CLICK:', item.id, item.title)
    console.log('ENVIANDO:', item.id, item.title)
    await onSendToN8n(item.id)
  }

  return (
    <article className={`relative rounded-xl border bg-zinc-800 p-4 shadow-lg shadow-black/20 transition-colors ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-zinc-700'}`}>
      <div className="absolute top-4 right-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 cursor-pointer rounded border-zinc-500 bg-zinc-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-800"
        />
      </div>

      <div className="mb-3 pr-6">
        <p className="text-xs uppercase tracking-wide text-zinc-400">{item.source}</p>
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">{item.title}</h3>
      </div>

      <p className="mb-3 text-xs text-zinc-300">{item.summary}</p>

      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="mb-3 h-40 w-full rounded-lg border border-zinc-700 object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
        <span>{formatDate(item.publishedAt)}</span>
        <span className={`rounded-md border px-2 py-1 ${statusStyles[currentStatus] ?? statusStyles.new}`}>
          {statusLabels[currentStatus] ?? currentStatus}
        </span>
      </div>

      <div className="mb-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSendingToN8n || !canSendToN8n}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={15} className={isSendingToN8n ? 'animate-pulse' : ''} />
          {!canSendToN8n
            ? 'Sin permiso para n8n'
            : isSendingToN8n
              ? 'Generando...'
              : 'Generar articulo'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          onClick={() => onOpenRelated(item)}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-600 bg-zinc-700/60 px-2 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          <Link2 size={14} /> Relacionadas
        </button>

        <a
          href={item.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-600 bg-zinc-700/60 px-2 py-2 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          <ExternalLink size={14} /> Abrir fuente
        </a>
      </div>
    </article>
  )
}
