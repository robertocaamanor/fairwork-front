import type { EditorialReviewStatus } from '../../types/editorial'

interface EditorialStatusTabsProps {
  value: EditorialReviewStatus
  onChange: (status: EditorialReviewStatus) => void
}

const STATUS_OPTIONS: Array<{ value: EditorialReviewStatus; label: string }> = [
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'draft_created', label: 'Enviadas a WordPress' },
]

export function EditorialStatusTabs({ value, onChange }: EditorialStatusTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_OPTIONS.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
