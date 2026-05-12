import type { EditorialReview } from '../../types/editorial'

interface EditorialContentModalProps {
  review: EditorialReview | null
  onClose: () => void
}

const htmlToPlainText = (content?: string): string => {
  if (!content) {
    return 'Sin contenido disponible.'
  }

  return content
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

export function EditorialContentModal({ review, onClose }: EditorialContentModalProps) {
  if (!review) {
    return null
  }

  const proposal = review.proposal
  const title = typeof proposal.titulo === 'string' ? proposal.titulo : 'Sin titulo generado'
  const subtitle = typeof proposal.bajada === 'string' ? proposal.bajada : 'Sin bajada'
  const meta =
    typeof proposal.meta_description === 'string'
      ? proposal.meta_description
      : 'Sin meta description'
  const body = htmlToPlainText(
    typeof proposal.contenido === 'string' ? proposal.contenido : undefined,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Vista previa SEO</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-200">
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-400">Bajada</p>
            <p>{subtitle}</p>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-zinc-400">Meta description</p>
            <p>{meta}</p>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Cuerpo</p>
            <pre className="whitespace-pre-wrap font-sans leading-relaxed text-zinc-100">{body}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
