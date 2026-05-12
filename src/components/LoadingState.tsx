interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Cargando noticias...' }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-300">
      <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-zinc-700" />
      <div className="mb-2 h-3 w-full animate-pulse rounded bg-zinc-700/80" />
      <div className="mb-4 h-3 w-5/6 animate-pulse rounded bg-zinc-700/70" />
      <p>{message}</p>
    </div>
  )
}
