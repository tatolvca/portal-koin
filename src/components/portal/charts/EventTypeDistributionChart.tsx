import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  type: string
  count: number
}

export function EventTypeDistributionChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis type="category" dataKey="type" width={75} tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
        <Bar dataKey="count" name="Eventos" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
