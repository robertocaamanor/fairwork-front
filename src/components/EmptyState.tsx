interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80 p-5 text-center text-sm text-zinc-400">
      {message}
    </div>
  )
}
