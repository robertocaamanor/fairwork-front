import { useEffect, useState } from 'react'
import {
  EDITORIAL_TONE_LABELS,
  type EditorialTone,
} from '../../types/news'

interface GenerateTopicProposalsModalProps {
  selectedCount: number
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (payload: { tone: EditorialTone; editorialContext?: string }) => void
}

const TONE_OPTIONS: EditorialTone[] = ['informative', 'critical', 'positive']

const TONE_HELP: Record<EditorialTone, string> = {
  informative:
    'Mantiene un enfoque informativo y equilibrado. No requiere contexto adicional.',
  critical:
    'Fuerza un enfoque critico para el lote completo y requiere contexto.',
  positive:
    'Fuerza un enfoque positivo para el lote completo y requiere contexto.',
}

export function GenerateTopicProposalsModal({
  selectedCount,
  isSubmitting,
  onCancel,
  onConfirm,
}: GenerateTopicProposalsModalProps) {
  const [tone, setTone] = useState<EditorialTone>('informative')
  const [editorialContext, setEditorialContext] = useState('')
  const isContextRequired = tone === 'critical' || tone === 'positive'

  useEffect(() => {
    setTone('informative')
    setEditorialContext('')
  }, [selectedCount])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl shadow-black/40">
        <h3 className="text-lg font-semibold text-zinc-100">Enviar lote a n8n</h3>
        <p className="mt-1 text-sm text-zinc-300">
          Vas a generar propuestas para {selectedCount} noticias seleccionadas.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <p className="text-sm font-medium text-zinc-100">Tono editorial del lote</p>
          <p className="mt-1 text-xs text-zinc-400">
            Elige si el lote debe salir en tono informativo, critico o positivo.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {TONE_OPTIONS.map((option) => {
              const isActive = tone === option

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  disabled={isSubmitting}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="block text-sm font-semibold">{EDITORIAL_TONE_LABELS[option]}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{TONE_HELP[option]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <label className="mt-4 block text-sm text-zinc-300">
          Contexto adicional {isContextRequired ? '(obligatorio)' : '(opcional)'}
          <textarea
            className="mt-2 h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/40 focus:ring"
            placeholder={
              isContextRequired
                ? 'Ej: enfocar la critica en insultos o detallar el angulo positivo que debe priorizar Gemini.'
                : 'Opcional: agrega una guia editorial para el lote si la necesitas.'
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