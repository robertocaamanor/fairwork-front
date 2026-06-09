import { useEffect, useState } from 'react'
import {
  EDITORIAL_TONE_LABELS,
  type EditorialTone,
  type NewsItem,
  type SendToN8nPayload,
} from '../../types/news'

interface SendToN8nModalProps {
  item: NewsItem | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (payload: SendToN8nPayload) => void
}

const RATING_LABELS: Record<number, string> = {
  1: 'Muy negativa',
  2: 'Negativa',
  3: 'Critica',
  4: 'Neutra',
  5: 'Levemente positiva',
  6: 'Positiva',
  7: 'Muy positiva',
}

const getRatingHelpText = (rating: number): string => {
  if (rating <= 3) {
    return 'Usa esta zona cuando la noticia requiera un enfoque critico, por ejemplo insultos o ataques contra un artista.'
  }

  if (rating >= 5) {
    return 'Usa esta zona cuando el enfoque deba resaltar una noticia positiva o favorable.'
  }

  return 'La zona neutra sirve cuando la noticia no exige elogio ni critica editorial marcada.'
}

export function SendToN8nModal({ item, isSubmitting, onCancel, onConfirm }: SendToN8nModalProps) {
  const [tone, setTone] = useState<EditorialTone>('informative')
  const [editorialRating, setEditorialRating] = useState(4)
  const [editorialContext, setEditorialContext] = useState('')
  const isContextRequired = tone === 'critical' || tone === 'positive'

  useEffect(() => {
    if (!item) {
      return
    }

    setTone('informative')
    setEditorialRating(4)
    setEditorialContext('')
  }, [item])

  if (!item) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-lg font-semibold text-zinc-100">Enviar noticia a n8n</h3>
        <p className="mt-1 text-sm text-zinc-300">{item.title}</p>

        <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-zinc-100">Tono editorial</p>
          <p className="mt-1 text-xs text-zinc-400">
            Elige si la nota debe salir con un enfoque informativo, critico o positivo.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(['informative', 'critical', 'positive'] as const).map((option) => {
              const isActive = tone === option

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  disabled={isSubmitting}
                  className={`rounded-lg border px-3 py-3 text-left transition ${isActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="block text-sm font-semibold">{EDITORIAL_TONE_LABELS[option]}</span>
                  <span className="mt-1 block text-xs text-zinc-400">
                    {option === 'informative'
                      ? 'No requiere contexto adicional; prioriza claridad y equilibrio.'
                      : option === 'critical'
                        ? 'Requiere contexto para orientar la critica y el angulo editorial.'
                        : 'Requiere contexto para orientar el enfoque positivo.'}
                  </span>
                </button>
              )}
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-zinc-100">Radar editorial</p>
          <p className="mt-1 text-xs text-zinc-400">Define si la noticia debe tratarse de 1 como negativa a 7 como positiva.</p>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const value = index + 1
              const isActive = editorialRating === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEditorialRating(value)}
                  disabled={isSubmitting}
                  className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${isActive ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {value}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-200">1-3 critica / negativa</span>
            <span className="rounded-full border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-200">4 neutral</span>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">5-7 positiva</span>
          </div>

          <p className="mt-3 text-sm text-zinc-200">{RATING_LABELS[editorialRating]}</p>
          <p className="mt-1 text-xs text-zinc-400">{getRatingHelpText(editorialRating)}</p>
        </div>

        <label className="mt-4 block text-sm text-zinc-300">
          Contexto adicional {isContextRequired ? '(obligatorio)' : '(opcional)'}
          <textarea
            className="mt-2 h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/40 focus:ring"
            placeholder={
              isContextRequired
                ? 'Ej: resaltar el insulto, la critica al artista o el angulo positivo que debe priorizarse.'
                : 'Opcional: agrega una guia editorial adicional si hace falta.'
            }
            value={editorialContext}
            onChange={(event) => setEditorialContext(event.target.value)}
            disabled={isSubmitting}
            maxLength={600}
          />
        </label>

        {isContextRequired && editorialContext.trim().length === 0 ? (
          <p className="mt-2 text-xs text-amber-300">
            Para tonos critico o positivo debes indicar contexto editorial.
          </p>
        ) : null}

        <p className="mt-2 text-xs text-zinc-500">El articulo pedira titular normal, con mayuscula inicial y nombres propios, evitando Title Case.</p>

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
            onClick={() =>
              onConfirm({
                tone,
                editorialRating,
                editorialContext: editorialContext.trim() || undefined,
              })
            }
            disabled={isSubmitting || (isContextRequired && editorialContext.trim().length === 0)}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar envio'}
          </button>
        </div>
      </div>
    </div>
  )
}