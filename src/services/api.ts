import axios, { AxiosError } from 'axios'
import type { LoginResponse, AuthUser } from '../types/auth'
import type {
  NewsCategory,
  NewsItem,
  NewsStatusPayload,
  NewsStatus,
} from '../types/news'
import { NEWS_CATEGORIES } from '../types/news'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  timeout: 15000,
})

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem('fairwork-token')
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

interface RawNewsItem {
  id: string | number
  title?: string
  source?: string
  sourceName?: string
  summary?: string
  content?: string
  originalUrl?: string
  url?: string
  category?: NewsCategory
  publishedAt?: string
  createdAt?: string
  score?: number
  relevanceScore?: number
  status?: NewsStatus | null
  imageUrl?: string | null
  image?: string | null
  resolvedUrl?: string
  resolvedSourceDomain?: string
  fullContent?: string
  cleanContent?: string
  extractedImageUrl?: string
  author?: string
}

const toStringId = (id: string | number): string => String(id)

const stripHtmlToText = (value: string): string => {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const isGooglePlaceholderTitle = (value?: string): boolean => {
  const normalized = stripHtmlToText(value ?? '').toLowerCase()
  if (!normalized) {
    return false
  }

  return normalized === 'google news' || normalized.startsWith('google news ')
}

const isGooglePlaceholderText = (value?: string): boolean => {
  const normalized = stripHtmlToText(value ?? '').toLowerCase()
  if (!normalized) {
    return false
  }

  return (
    normalized.includes('comprehensive up-to-date news coverage') ||
    normalized.includes('aggregated from sources all over the world by google news') ||
    normalized === 'google news'
  )
}

const isGoogleIntermediateUrl = (url?: string): boolean => {
  const normalized = (url ?? '').trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return (
    normalized.includes('news.google.com/rss/articles') ||
    normalized.includes('news.google.com/articles') ||
    normalized.includes('google.com/rss/articles')
  )
}

const shouldHideItem = (item: NewsItem): boolean => {
  if (isGooglePlaceholderTitle(item.title)) {
    return true
  }

  if (isGooglePlaceholderText(item.summary) || isGooglePlaceholderText(item.content)) {
    return true
  }

  // Hide low-quality Google intermediate entries with no useful resolved source.
  return isGoogleIntermediateUrl(item.originalUrl) && !item.resolvedUrl && isGooglePlaceholderText(item.summary)
}

const normalizeNewsItem = (item: RawNewsItem): NewsItem => ({
  id: toStringId(item.id),
  sourceName: item.sourceName?.trim() || item.source?.trim() || 'Fuente desconocida',
  title: item.title?.trim() || 'Sin titulo',
  source: item.resolvedSourceDomain?.replace(/^www\./i, '')?.trim() || item.sourceName?.replace(/ RSS$/i, '')?.trim() || item.source?.replace(/ RSS$/i, '')?.trim() || 'Fuente desconocida',
  summary: item.summary?.trim() || item.content?.trim() || 'Sin resumen disponible.',
  content: item.content?.trim() || undefined,
  originalUrl: item.originalUrl?.trim() || item.url?.trim() || '#',
  resolvedUrl: item.resolvedUrl?.trim() || undefined,
  resolvedSourceDomain: item.resolvedSourceDomain?.trim() || undefined,
  fullContent: item.fullContent?.trim() || undefined,
  cleanContent: item.cleanContent?.trim() || undefined,
  extractedImageUrl: item.extractedImageUrl?.trim() || undefined,
  author: item.author?.trim() || undefined,
  category: item.category ?? 'tv_chilena',
  publishedAt: item.publishedAt ?? item.createdAt ?? new Date().toISOString(),
  score: Number(item.score ?? item.relevanceScore ?? 0),
  status: item.status ?? 'new',
  imageUrl: item.imageUrl ?? item.image ?? null,
})

const normalizeCollection = (payload: unknown): NewsItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeNewsItem(item as RawNewsItem))
      .filter((item) => !shouldHideItem(item))
  }

  if (payload && typeof payload === 'object' && 'items' in payload) {
    const maybeItems = (payload as { items?: unknown }).items
    if (Array.isArray(maybeItems)) {
      return maybeItems
        .map((item) => normalizeNewsItem(item as RawNewsItem))
        .filter((item) => !shouldHideItem(item))
    }
  }

  return []
}

const normalizeLatestGrouped = (payload: unknown): Record<NewsCategory, NewsItem[]> => {
  const grouped = {} as Record<NewsCategory, NewsItem[]>

  for (const category of NEWS_CATEGORIES) {
    grouped[category] = []
  }

  if (!payload || typeof payload !== 'object') {
    return grouped
  }

  for (const category of NEWS_CATEGORIES) {
    const maybeItems = (payload as Record<string, unknown>)[category]
    grouped[category] = normalizeCollection(maybeItems)
  }

  return grouped
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>
    const status = axiosError.response?.status
    const message = axiosError.response?.data?.message

    if (Array.isArray(message)) {
      return `Error ${status ?? ''}: ${message.join(', ')}`.trim()
    }

    if (typeof message === 'string' && message.length > 0) {
      return `Error ${status ?? ''}: ${message}`.trim()
    }

    if (axiosError.message) {
      return `Error de red: ${axiosError.message}`
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado al comunicarse con la API.'
}

export const sendNewsToN8n = (id: string | number) => {
  return apiClient.post(`/news/${id}/send-to-n8n`)
}

export const authStorage = {
  getToken(): string | null {
    return getStoredToken()
  },
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('fairwork-token', token)
    }
  },
  clearToken() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('fairwork-token')
    }
  },
}

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { username, password })
    return response.data as LoginResponse
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get('/auth/me')
    return response.data as AuthUser
  },

  async getLatestNewsGrouped(): Promise<Record<NewsCategory, NewsItem[]>> {
    const response = await apiClient.get('/news/latest')
    return normalizeLatestGrouped(response.data)
  },

  async getNewsByCategory(category: NewsCategory): Promise<NewsItem[]> {
    const response = await apiClient.get('/news', {
      params: { category, limit: 20 },
    })

    return normalizeCollection(response.data)
  },

  async getNewsByCategoryWithOffset(
    category: NewsCategory,
    q: string,
    filterStatus: string,
    offset: number
  ): Promise<NewsItem[]> {
    const params: Record<string, any> = { category, offset, limit: 20 }
    if (q) params.q = q
    if (filterStatus !== 'all') params.status = filterStatus

    const response = await apiClient.get('/news', { params })
    return normalizeCollection(response.data)
  },

  async searchGlobalNews(
    q: string,
    source: string,
    filterStatus: string,
    offset: number
  ): Promise<NewsItem[]> {
    const params: Record<string, any> = { offset, limit: 20 }
    if (q) params.q = q
    if (source) params.source = source
    if (filterStatus !== 'all') params.status = filterStatus

    const response = await apiClient.get('/news', { params })
    return normalizeCollection(response.data)
  },

  async searchNewsByCategory(category: NewsCategory, q: string): Promise<NewsItem[]> {
    const response = await apiClient.get('/news', {
      params: { category, q, limit: 20 },
    })

    return normalizeCollection(response.data)
  },

  async getRelatedNewsById(newsId: string): Promise<NewsItem[]> {
    const response = await apiClient.get('/news/related', {
      params: { newsId, limit: 10 },
    })

    return normalizeCollection(response.data)
  },

  async searchRelatedNews(q: string, category: NewsCategory, source?: string): Promise<NewsItem[]> {
    const response = await apiClient.get('/news/related', {
      params: { q, category, source, limit: 10 },
    })

    return normalizeCollection(response.data)
  },

  async updateNewsStatus(id: string, payload: NewsStatusPayload): Promise<NewsItem> {
    const response = await apiClient.patch(`/news/${id}/status`, payload)
    return normalizeNewsItem(response.data as RawNewsItem)
  },

  async sendNewsToN8n(id: string | number): Promise<{
    success: boolean
    message: string
    newsId: string
  }> {
    const response = await sendNewsToN8n(id)
    return response.data as { success: boolean; message: string; newsId: string }
  },

  async generateTopicProposals(payload: {
    newsIds: string[]
    tone?: string
    requestedProposals?: number
  }): Promise<unknown> {
    const response = await apiClient.post('/editorial/topics/generate-proposals', payload)
    return response.data
  },

  async triggerScraping(): Promise<{ message: string }> {
    const response = await apiClient.post('/news/scrape')

    if (response.data && typeof response.data === 'object' && 'message' in response.data) {
      return response.data as { message: string }
    }

    return { message: 'Scraping ejecutado correctamente.' }
  },
}
