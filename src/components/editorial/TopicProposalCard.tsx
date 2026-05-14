import { ExternalLink, FileText, Share2 } from 'lucide-react'
import type { EditorialTopicProposal } from '../../types/editorial'

interface TopicProposalCardProps {
  proposal: EditorialTopicProposal
}

const statusStyles: Record<EditorialTopicProposal['status'], string> = {
  pending_review: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  selected: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  draft_created: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
}

const readText = (value: unknown, fallback = 'Sin dato'): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  return fallback
}

const htmlToPreview = (content?: string): string => {
  if (!content) {
    return 'Sin contenido generado.'
  }

  return content
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/<\s*\/p\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const socialSummary = (social?: Record<string, unknown> | null): string => {
  if (!social) {
    return 'Sin paquete social.'
  }

  const channels = Object.keys(social)
  if (channels.length === 0) {
    return 'Sin paquete social.'
  }

  return channels.join(', ')
}

export function TopicProposalCard({ proposal }: TopicProposalCardProps) {
  const title = readText(proposal.proposal.titulo, `Propuesta ${proposal.proposalIndex}`)
  const subtitle = readText(proposal.proposal.bajada)
  const content = htmlToPreview(
    typeof proposal.proposal.contenido === 'string' ? proposal.proposal.contenido : undefined,
  )
  const primarySource = proposal.sources.find((source) => source.url)

  return (
    <article className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 shadow-lg shadow-black/20">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Enfoque {proposal.proposalIndex}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-tight text-zinc-100">{title}</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-md border px-2 py-1 ${statusStyles[proposal.status]}`}>
            {proposal.status}
          </span>
          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-200">
            {proposal.tone}
          </span>
        </div>
      </div>

      <div className="grid gap-3 text-sm text-zinc-300">
        <p>
          <span className="text-zinc-500">Bajada:</span> {subtitle}
        </p>
        <p>
          <span className="text-zinc-500">Cuerpo:</span> {content}
        </p>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-zinc-500">
            <FileText size={14} />
            Fuentes
          </div>
          <p>{proposal.sources.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-zinc-500">
            <Share2 size={14} />
            Social
          </div>
          <p>{socialSummary(proposal.social)}</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          <p className="mb-1 text-xs uppercase text-zinc-500">Tema</p>
          <p className="truncate">{proposal.theme}</p>
        </div>
      </div>

      {primarySource?.url ? (
        <a
          href={primarySource.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
        >
          <ExternalLink size={16} />
          Fuente principal
        </a>
      ) : null}
    </article>
  )
}
