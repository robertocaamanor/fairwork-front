import { Search, X } from 'lucide-react'

interface ColumnSearchInputProps {
  value: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
  onClear: () => void
}

export function ColumnSearchInput({
  value,
  placeholder,
  disabled,
  onChange,
  onClear,
}: ColumnSearchInputProps) {
  return (
    <div className="mb-3">
      <label className="relative block">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-9 text-sm text-zinc-100 outline-none ring-cyan-400/40 placeholder:text-zinc-500 focus:ring disabled:cursor-not-allowed disabled:opacity-60"
        />

        {value.trim().length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-zinc-700 bg-zinc-900 p-1 text-zinc-300 transition hover:bg-zinc-800"
            aria-label="Limpiar busqueda"
          >
            <X size={12} />
          </button>
        ) : null}
      </label>
    </div>
  )
}
