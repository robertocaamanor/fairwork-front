import { ExternalLink, FileText, Send, Share2 } from 'lucide-react'
import type { EditorialTopicProposal } from '../../types/editorial'

interface TopicProposalDetailPanelProps {
  proposals: EditorialTopicProposal[]
  selectedProposalId: number | null
  isSending: boolean
  sendError?: string
  onSelectProposal: (proposalId: number) => void
  onSendToWordpress: (proposal: EditorialTopicProposal) => void
}

const readText = (value: unknown, fallback = 'Sin dato'): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

const readRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return null
}

const htmlToPlainText = (content?: string): string => {
  if (!content) {
    return 'Sin contenido generado.'
  }

  return content
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const formatJson = (value: unknown): string => JSON.stringify(value ?? null, null, 2)

const fieldRows = (fields: Array<[string, unknown]>) =>
  fields.map(([label, value]) => (
    <div key={label} className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
      <p className="mb-1 text-xs uppercase text-zinc-500">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-zinc-100">{readText(value)}</p>
    </div>
  ))

export function TopicProposalDetailPanel({
  proposals,
  selectedProposalId,
  isSending,
  sendError,
  onSelectProposal,
  onSendToWordpress,
}: TopicProposalDetailPanelProps) {
  const selectedProposal =
    proposals.find((proposal) => proposal.id === selectedProposalId) ?? proposals[0]

  if (!selectedProposal) {
    return null
  }

  const proposal = selectedProposal.proposal
  const seo = readRecord(proposal.seo)
  const wordpressLink = selectedProposal.wordpressLink

  const seoFields: Array<[string, unknown]> = [
    ['Keyword', proposal.keyword ?? seo?.keyword],
    ['Meta title', proposal.meta_title ?? proposal.seo_title ?? seo?.title ?? seo?.meta_title],
    ['Meta description', proposal.meta_description ?? seo?.description ?? seo?.meta_description],
    ['Slug', proposal.slug ?? seo?.slug],
    ['Categoria sugerida', proposal.categoria_sugerida],
    ['Riesgo editorial', proposal.riesgo_editorial],
    ['Nota editor IA', proposal.nota_editor],
  ]

  return (
    <section className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-0 flex-1 text-sm font-medium text-zinc-200">
          Propuesta del tema
          <select
            value={selectedProposal.id}
            onChange={(event) => onSelectProposal(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-400/40 focus:ring"
          >
            {proposals.map((item) => (
              <option key={item.id} value={item.id}>
                Enfoque {item.proposalIndex}: {readText(item.proposal.titulo, `Propuesta ${item.proposalIndex}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          {wordpressLink ? (
            <a
              href={wordpressLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
            >
              <ExternalLink size={16} />
              Ver borrador
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => onSendToWordpress(selectedProposal)}
            disabled={isSending || selectedProposal.status === 'draft_created'}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {selectedProposal.status === 'draft_created' ? 'Enviado a WordPress' : 'Enviar a WordPress'}
          </button>
        </div>
      </div>

      {sendError ? (
        <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          {sendError}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">Titulo generado</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-100">
            {readText(proposal.titulo, `Propuesta ${selectedProposal.proposalIndex}`)}
          </h3>
          <p className="mt-2 text-sm text-zinc-300">{readText(proposal.bajada)}</p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-100">SEO generado</h4>
          <div className="grid gap-2 md:grid-cols-2">{fieldRows(seoFields)}</div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <p className="mb-2 text-xs uppercase text-zinc-500">Cuerpo</p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-100">
            {htmlToPlainText(typeof proposal.contenido === 'string' ? proposal.contenido : undefined)}
          </pre>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase text-zinc-500">
              <Share2 size={14} />
              Social
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-zinc-200">
              {formatJson(selectedProposal.social)}
            </pre>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase text-zinc-500">
              <FileText size={14} />
              Gutenberg
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs text-zinc-200">
              {formatJson(selectedProposal.gutenberg)}
            </pre>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <p className="mb-2 text-xs uppercase text-zinc-500">Fuentes</p>
          <div className="grid gap-2">
            {selectedProposal.sources.length > 0 ? (
              selectedProposal.sources.map((source, index) => (
                <div key={`${source.url ?? source.title ?? 'source'}-${index}`} className="text-sm text-zinc-200">
                  <p className="font-medium text-zinc-100">{readText(source.title, `Fuente ${index + 1}`)}</p>
                  <p className="text-zinc-400">{readText(source.sourceName)}</p>
                  {source.summary ? <p className="mt-1 text-zinc-300">{source.summary}</p> : null}
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-cyan-200 hover:text-cyan-100"
                    >
                      <ExternalLink size={14} />
                      Abrir fuente
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Sin fuentes asociadas.</p>
            )}
          </div>
        </div>

        <details className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <summary className="cursor-pointer text-sm font-medium text-zinc-100">Datos completos</summary>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs text-zinc-300">
            {formatJson(selectedProposal)}
          </pre>
        </details>
      </div>
    </section>
  )
}
