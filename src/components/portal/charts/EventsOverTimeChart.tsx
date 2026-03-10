import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'

interface DataPoint {
  date: string
  count: number
  highRisk: number
}

export function EventsOverTimeChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillHighRisk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(239 68 68)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(239 68 68)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM yyyy', { locale: es })} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
        <Area type="monotone" dataKey="count" name="Eventos" stroke="#6366f1" fill="url(#fillCount)" strokeWidth={2} />
        <Area type="monotone" dataKey="highRisk" name="Alto riesgo" stroke="#ef4444" fill="url(#fillHighRisk)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
