import { Clock3 } from 'lucide-react'
import type { OrderEvent } from '../../types/order'
import { PanelTitle } from '../PanelTitle'

type OrderEventsProps = {
  events: OrderEvent[]
  notice: string
}

export function OrderEvents({ events, notice }: OrderEventsProps) {
  return (
    <section className="panel event-panel">
      <PanelTitle icon={<Clock3 size={18} />} title="실시간 이벤트" action="Redis" />
      <ol>
        {events.length === 0 ? (
          <li>{notice}</li>
        ) : (
          events.slice(0, 5).map((event) => <li key={event.eventId}>{event.message}</li>)
        )}
      </ol>
    </section>
  )
}
