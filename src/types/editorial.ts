export const EDITORIAL_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'draft_created',
] as const

export type EditorialReviewStatus = (typeof EDITORIAL_STATUSES)[number]

export interface EditorialProposal {
  titulo?: string
  bajada?: string
  keyword?: string
  meta_description?: string
  categoria_sugerida?: string
  riesgo_editorial?: 'bajo' | 'medio' | 'alto' | string
  nota_editor?: string
  contenido?: string
  [key: string]: unknown
}

export interface EditorialReview {
  id: number
  newsId: number
  originalUrl: string
  sourceName: string
  category: string
  score: number
  originalTitle: string
  proposal: EditorialProposal
  status: EditorialReviewStatus
  editorNote?: string | null
  rejectionReason?: string | null
  wordpressPostId?: number | null
  wordpressLink?: string | null
  createdAt: string
  updatedAt: string
}

export const EDITORIAL_TOPIC_PROPOSAL_STATUSES = [
  'pending_review',
  'selected',
  'rejected',
  'draft_created',
] as const

export type EditorialTopicProposalStatus = (typeof EDITORIAL_TOPIC_PROPOSAL_STATUSES)[number]

export interface EditorialTopicSource {
  title?: string
  url?: string
  sourceName?: string
  summary?: string
}

export interface EditorialTopicProposal {
  id: number
  topicId: string
  theme: string
  sources: EditorialTopicSource[]
  requestedProposals: number
  tone: string
  proposalIndex: number
  proposal: EditorialProposal
  social?: Record<string, unknown> | null
  gutenberg?: Record<string, unknown> | null
  status: EditorialTopicProposalStatus
  createdByUserId?: string | null
  wordpressPostId?: number | null
  wordpressLink?: string | null
  createdAt: string
  updatedAt: string
}

export interface EditorialTopic {
  id: string
  theme: string
  category: string
  tone: string
  proposalCount: number
  createdAt?: string
  updatedAt?: string
}
