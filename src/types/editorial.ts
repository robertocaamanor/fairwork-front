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
