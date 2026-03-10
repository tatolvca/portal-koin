import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  subtitle?: string
}

export function KPICard({ title, value, delta, deltaLabel, subtitle }: KPICardProps) {
  const positive = delta != null && delta >= 0
  const negative = delta != null && delta < 0
  return (
    <div className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {delta != null && (
          <span className={`flex items-center gap-0.5 text-sm font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      {(deltaLabel || subtitle) && <p className="mt-1 text-xs text-gray-500">{deltaLabel ?? subtitle}</p>}
    </div>
  )
}
