import type { NewsCategory } from '../types/news'

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  tv_chilena: 'TV Chilena',
  musica: 'Música',
  tecnologia: 'Tecnología',
  streaming: 'Streaming',
  tv_argentina: 'TV Argentina',
  tv_mexicana: 'TV Mexicana',
  tv_espanola: 'TV Española',
  tv_italiana: 'TV Italiana',
  tv_usa: 'TV USA',
  cine: 'Cine',
  sanremo: 'Sanremo',
  eurovision: 'Eurovisión',
  vina_del_mar: 'Festival de Viña',
  coachella: 'Coachella',
  fiebre_de_baile: 'Fiebre de Baile',
  vecinos_al_limite: 'Vecinos al Límite',
}

export const CATEGORY_ACCENTS: Record<NewsCategory, string> = {
  tv_chilena: 'border-l-4 border-cyan-500',
  musica: 'border-l-4 border-fuchsia-500',
  tecnologia: 'border-l-4 border-emerald-500',
  streaming: 'border-l-4 border-violet-500',
  tv_argentina: 'border-l-4 border-sky-400',
  tv_mexicana: 'border-l-4 border-green-500',
  tv_espanola: 'border-l-4 border-yellow-500',
  tv_italiana: 'border-l-4 border-red-500',
  tv_usa: 'border-l-4 border-blue-500',
  cine: 'border-l-4 border-amber-500',
  sanremo: 'border-l-4 border-rose-400',
  eurovision: 'border-l-4 border-indigo-400',
  vina_del_mar: 'border-l-4 border-orange-400',
  coachella: 'border-l-4 border-lime-400',
  fiebre_de_baile: 'border-l-4 border-pink-500',
  vecinos_al_limite: 'border-l-4 border-teal-500',
}

export const CATEGORY_HEADER_ACCENTS: Record<NewsCategory, string> = {
  tv_chilena: 'text-cyan-300',
  musica: 'text-fuchsia-300',
  tecnologia: 'text-emerald-300',
  streaming: 'text-violet-300',
  tv_argentina: 'text-sky-300',
  tv_mexicana: 'text-green-300',
  tv_espanola: 'text-yellow-300',
  tv_italiana: 'text-red-300',
  tv_usa: 'text-blue-300',
  cine: 'text-amber-300',
  sanremo: 'text-rose-300',
  eurovision: 'text-indigo-300',
  vina_del_mar: 'text-orange-300',
  coachella: 'text-lime-300',
  fiebre_de_baile: 'text-pink-300',
  vecinos_al_limite: 'text-teal-300',
}

export const DEFAULT_VISIBLE_CATEGORIES: Set<NewsCategory> = new Set([
  'tv_chilena',
  'musica',
  'tecnologia',
  'streaming',
])
