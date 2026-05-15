import type { NewsCategory } from '../types/news'

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  tv_chilena: 'TV chilena',
  tv_internacional: 'TV internacional',
  musica: 'Musica',
  tecnologia: 'Tecnologia',
  streaming: 'Streaming',
  radio: 'Radio',
  fiebre_de_baile: 'Fiebre de Baile',
}

export const CATEGORY_ACCENTS: Record<NewsCategory, string> = {
  tv_chilena: 'border-l-4 border-cyan-500',
  tv_internacional: 'border-l-4 border-sky-500',
  musica: 'border-l-4 border-fuchsia-500',
  tecnologia: 'border-l-4 border-emerald-500',
  streaming: 'border-l-4 border-violet-500',
  radio: 'border-l-4 border-amber-500',
  fiebre_de_baile: 'border-l-4 border-pink-500',
}

export const CATEGORY_HEADER_ACCENTS: Record<NewsCategory, string> = {
  tv_chilena: 'text-cyan-300',
  tv_internacional: 'text-sky-300',
  musica: 'text-fuchsia-300',
  tecnologia: 'text-emerald-300',
  streaming: 'text-violet-300',
  radio: 'text-amber-300',
  fiebre_de_baile: 'text-pink-300',
}
