export const NEWS_CATEGORIES = [
  'tv_chilena',
  'musica',
  'tecnologia',
  'streaming',
  'tv_argentina',
  'tv_mexicana',
  'tv_espanola',
  'tv_italiana',
  'tv_usa',
  'cine',
  'sanremo',
  'eurovision',
  'vina_del_mar',
  'coachella',
  'fiebre_de_baile',
  'el_internado_mega',
  'vecinos_al_limite',
] as const

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]

export type NewsStatus = 'new' | 'selected' | 'discarded' | 'sent_to_n8n'

export type NewsFilter = 'score70' | 'all' | 'new' | 'selected' | 'discarded'

export const EDITORIAL_TONES = ['informative', 'positive', 'critical'] as const

export type EditorialTone = (typeof EDITORIAL_TONES)[number]

export const EDITORIAL_TONE_LABELS: Record<EditorialTone, string> = {
  informative: 'Informativo',
  positive: 'Positiva',
  critical: 'Critica',
}

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

export interface SendToN8nPayload {
  tone?: EditorialTone
  editorialRating: number
  editorialContext?: string
}
