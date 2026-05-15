export const NEWS_CATEGORIES = [
  'tv_chilena',
  'tv_internacional',
  'musica',
  'tecnologia',
  'streaming',
  'radio',
  'fiebre_de_baile',
] as const

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export type NewsStatus = 'new' | 'selected' | 'discarded' | 'sent_to_n8n'

export type NewsFilter = 'score70' | 'all' | 'new' | 'selected' | 'discarded'

export interface NewsItem {
  id: string
  sourceName: string
  title: string
  source: string
  summary: string
  content?: string
  originalUrl: string
  resolvedUrl?: string
  resolvedSourceDomain?: string
  fullContent?: string
  cleanContent?: string
  extractedImageUrl?: string
  author?: string
  category: NewsCategory
  publishedAt: string
  score: number
  status: NewsStatus | null
  imageUrl?: string | null
}

export interface NewsStatusPayload {
  status: NewsStatus
}
