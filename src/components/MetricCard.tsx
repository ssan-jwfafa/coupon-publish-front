import type { ReactNode } from 'react'

type MetricCardProps = {
  icon: ReactNode
  label: string
  value: string
  detail: string
}

export function MetricCard({ icon, label, value, detail }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}
