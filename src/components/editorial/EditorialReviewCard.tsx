import { Check, ExternalLink, FileText, X } from 'lucide-react'
import type { EditorialReview } from '../../types/editorial'

interface EditorialReviewCardProps {
  review: EditorialReview
  isSubmitting: boolean
  onApprove: (review: EditorialReview) => void
  onReject: (review: EditorialReview) => void
  onViewContent: (review: EditorialReview) => void
}

const statusStyles: Record<EditorialReview['status'], string> = {
  pending_review: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  draft_created: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
}

const riskStyles: Record<string, string> = {
  bajo: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  medio: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  alto: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
}

const scoreStyles = (score: number): string => {
  if (score >= 80) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
  if (score >= 60) return 'border-amber-500/40 bg-amber-500/10 text-amber-200'
  return 'border-zinc-600 bg-zinc-700/40 text-zinc-200'
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Fecha desconocida'
  }

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const readProposalValue = (value: unknown, fallback = 'Sin dato'): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  return fallback
}

export function EditorialReviewCard({
  review,
  isSubmitting,
  onApprove,
  onReject,
  onViewContent,
}: EditorialReviewCardProps) {
  const proposal = review.proposal
  const risk = readProposalValue(proposal.riesgo_editorial, 'sin_dato').toLowerCase()

  return (
    <article className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-lg shadow-black/20">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight text-zinc-100">
          {readProposalValue(proposal.titulo, 'Sin titulo generado')}
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-md border px-2 py-1 ${statusStyles[review.status]}`}>
            {review.status}
          </span>
          <span className={`rounded-md border px-2 py-1 ${scoreStyles(review.score)}`}>
            score {review.score}
          </span>
          <span
            className={`rounded-md border px-2 py-1 ${riskStyles[risk] ?? 'border-zinc-600 bg-zinc-700/40 text-zinc-200'}`}
          >
            riesgo {risk}
          </span>
        </div>
      </div>

      <div className="mb-3 grid gap-2 text-sm text-zinc-300">
        <p><span className="text-zinc-500">Bajada:</span> {readProposalValue(proposal.bajada)}</p>
        <p><span className="text-zinc-500">Keyword:</span> {readProposalValue(proposal.keyword)}</p>
        <p>
          <span className="text-zinc-500">Meta description:</span>{' '}
          {readProposalValue(proposal.meta_description)}
        </p>
        <p>
          <span className="text-zinc-500">Categoria sugerida:</span>{' '}
          {readProposalValue(proposal.categoria_sugerida)}
        </p>
        <p><span className="text-zinc-500">Nota editor IA:</span> {readProposalValue(proposal.nota_editor)}</p>
      </div>

      <div className="mb-3 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-sm text-zinc-300">
        <p><span className="text-zinc-500">Titulo original:</span> {review.originalTitle}</p>
        <p><span className="text-zinc-500">Fuente:</span> {review.sourceName}</p>
        <p><span className="text-zinc-500">Categoria:</span> {review.category}</p>
        <p><span className="text-zinc-500">Creada:</span> {formatDate(review.createdAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onApprove(review)}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check size={14} /> Aprobar
        </button>

        <button
          type="button"
          onClick={() => onReject(review)}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={14} /> Rechazar
        </button>

        <a
          href={review.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
        >
          <ExternalLink size={14} /> Abrir fuente
        </a>

        <button
          type="button"
          onClick={() => onViewContent(review)}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
        >
          <FileText size={14} /> Ver cuerpo
        </button>
      </div>
    </article>
  )
}
