interface ScoreBadgeProps {
  score: number
}

const getScoreStyles = (score: number): string => {
  if (score >= 85) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  if (score >= 70) return 'bg-lime-500/20 text-lime-300 border-lime-500/40'
  if (score >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${getScoreStyles(
        score,
      )}`}
    >
      Score {Math.round(score)}
    </span>
  )
}
