import { X } from 'lucide-react'
import { CATEGORY_LABELS } from '../constants/categories'
import type { NewsCategory } from '../types/news'

interface CategoryVisibilityModalProps {
  visibleCategories: Set<NewsCategory>
  onToggleCategory: (category: NewsCategory) => void
  onClose: () => void
}

export function CategoryVisibilityModal({
  visibleCategories,
  onToggleCategory,
  onClose,
}: CategoryVisibilityModalProps) {
  const categories = Object.keys(CATEGORY_LABELS) as NewsCategory[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Columnas visibles</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-4">
          <p className="mb-4 text-sm text-zinc-400">
            Selecciona las categorías que deseas mostrar u ocultar en el panel principal.
          </p>

          <div className="flex flex-col gap-3">
            {categories.map((category) => {
              const isVisible = visibleCategories.has(category)
              return (
                <label
                  key={category}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                    isVisible
                      ? 'border-cyan-500/50 bg-cyan-500/5'
                      : 'border-zinc-800 bg-zinc-800/50'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isVisible ? 'text-zinc-100' : 'text-zinc-400'
                    }`}
                  >
                    {CATEGORY_LABELS[category]}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isVisible}
                      onChange={() => onToggleCategory(category)}
                    />
                    <div
                      className={`block h-6 w-10 rounded-full transition-colors ${
                        isVisible ? 'bg-cyan-500' : 'bg-zinc-700'
                      }`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        isVisible ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <footer className="flex justify-end border-t border-zinc-800 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
