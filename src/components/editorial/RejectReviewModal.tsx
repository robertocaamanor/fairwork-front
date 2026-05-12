import { useState } from 'react'
import type { EditorialReview } from '../../types/editorial'

interface RejectReviewModalProps {
  review: EditorialReview | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (reason?: string) => void
}

export function RejectReviewModal({
  review,
  isSubmitting,
  onCancel,
  onConfirm,
}: RejectReviewModalProps) {
  const [reason, setReason] = useState('')

  if (!review) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-lg font-semibold text-zinc-100">Rechazar propuesta</h3>
        <p className="mt-1 text-sm text-zinc-300">{review.proposal.titulo ?? review.originalTitle}</p>

        <label className="mt-4 block text-sm text-zinc-300">
          Motivo (opcional)
          <textarea
            className="mt-2 h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/40 focus:ring"
            placeholder="Ej: Duplicada, poco valor editorial, titular debil..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
          />
        </label>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting}
            className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  )
}
