import type { NewsFilter } from '../types/news'

interface CategoryFilterProps {
  value: NewsFilter
  onChange: (value: NewsFilter) => void
}

const FILTER_OPTIONS: Array<{ value: NewsFilter; label: string }> = [
  { value: 'score70', label: 'Solo score >= 70' },
  { value: 'all', label: 'Todas' },
  { value: 'new', label: 'Nuevas' },
  { value: 'selected', label: 'Seleccionadas' },
  { value: 'discarded', label: 'Descartadas' },
]

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-200">
      <span className="font-medium">Filtro</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as NewsFilter)}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-sky-500"
      >
        {FILTER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
