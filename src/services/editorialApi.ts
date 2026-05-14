import axios from 'axios'
import type {
  EditorialReview,
  EditorialReviewStatus,
  EditorialTopicProposal,
  EditorialTopicProposalStatus,
  EditorialTopicSource,
} from '../types/editorial'
import { authStorage } from './api'

const editorialClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  timeout: 15000,
})

editorialClient.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const normalizeReview = (payload: unknown): EditorialReview => {
  const item = (payload ?? {}) as Partial<EditorialReview>

  return {
    id: Number(item.id ?? 0),
    newsId: Number(item.newsId ?? 0),
    originalUrl: String(item.originalUrl ?? ''),
    sourceName: String(item.sourceName ?? 'Fuente desconocida'),
    category: String(item.category ?? 'sin_categoria'),
    score: Number(item.score ?? 0),
    originalTitle: String(item.originalTitle ?? 'Sin titulo original'),
    proposal: (item.proposal ?? {}) as EditorialReview['proposal'],
    status: (item.status ?? 'pending_review') as EditorialReviewStatus,
    editorNote: item.editorNote ?? null,
    rejectionReason: item.rejectionReason ?? null,
    wordpressPostId: item.wordpressPostId ?? null,
    wordpressLink: item.wordpressLink ?? null,
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
  }
}

const normalizeRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return null
}

const normalizeSources = (value: unknown): EditorialTopicSource[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => {
    const source = (item ?? {}) as Partial<EditorialTopicSource>

    return {
      title: source.title ? String(source.title) : undefined,
      url: source.url ? String(source.url) : undefined,
      sourceName: source.sourceName ? String(source.sourceName) : undefined,
      summary: source.summary ? String(source.summary) : undefined,
    }
  })
}

const normalizeTopicProposal = (payload: unknown): EditorialTopicProposal => {
  const item = (payload ?? {}) as Partial<EditorialTopicProposal>

  return {
    id: Number(item.id ?? 0),
    topicId: String(item.topicId ?? ''),
    theme: String(item.theme ?? 'Tema sin titulo'),
    sources: normalizeSources(item.sources),
    requestedProposals: Number(item.requestedProposals ?? 5),
    tone: String(item.tone ?? 'informativo'),
    proposalIndex: Number(item.proposalIndex ?? 0),
    proposal: (item.proposal ?? {}) as EditorialTopicProposal['proposal'],
    social: normalizeRecord(item.social),
    gutenberg: normalizeRecord(item.gutenberg),
    status: (item.status ?? 'pending_review') as EditorialTopicProposalStatus,
    createdByUserId: item.createdByUserId ?? null,
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    updatedAt: String(item.updatedAt ?? new Date().toISOString()),
  }
}

export const getEditorialReviews = async (
  status: EditorialReviewStatus,
): Promise<EditorialReview[]> => {
  const response = await editorialClient.get('/editorial/reviews', {
    params: { status },
  })

  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data.map((item: unknown) => normalizeReview(item))
}

export const approveEditorialReview = async (id: number): Promise<EditorialReview> => {
  const response = await editorialClient.patch(`/editorial/reviews/${id}/status`, {
    status: 'approved',
    editorNote: 'Aprobada desde panel editorial',
  })

  return normalizeReview(response.data)
}

export const rejectEditorialReview = async (
  id: number,
  reason?: string,
): Promise<EditorialReview> => {
  const payload: { status: 'rejected'; rejectionReason?: string } = {
    status: 'rejected',
  }

  const normalizedReason = reason?.trim()
  if (normalizedReason) {
    payload.rejectionReason = normalizedReason
  }

  const response = await editorialClient.patch(`/editorial/reviews/${id}/status`, payload)
  return normalizeReview(response.data)
}

export const getTopicProposals = async (topicId: string): Promise<EditorialTopicProposal[]> => {
  const response = await editorialClient.get(`/editorial/topics/${encodeURIComponent(topicId)}/proposals`)

  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data.map((item: unknown) => normalizeTopicProposal(item))
}
