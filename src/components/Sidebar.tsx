import { Database, ExternalLink, RadioTower, Ticket } from 'lucide-react'

const KAFKA_UI_URL = import.meta.env.VITE_KAFKA_UI_URL ?? 'http://localhost:8081'
const REDIS_UI_URL = import.meta.env.VITE_REDIS_UI_URL ?? 'http://localhost:8082'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Ticket size={22} />
        </div>
        <div>
          <strong>Coupon Publish</strong>
          <span>Kafka/Flink Lab</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="External tools">
        <a href={KAFKA_UI_URL} target="_blank" rel="noreferrer">
          <RadioTower size={18} />
          Kafka UI
          <ExternalLink size={14} />
        </a>
        <a href={REDIS_UI_URL} target="_blank" rel="noreferrer">
          <Database size={18} />
          Redis UI
          <ExternalLink size={14} />
        </a>
      </nav>

      <div className="flow-panel">
        <span className="eyebrow">Event Flow</span>
        <ol>
          <li>API issues coupon</li>
          <li>Kafka receives event</li>
          <li>Flink aggregates</li>
          <li>Redis stores state</li>
        </ol>
      </div>
    </aside>
  )
}
