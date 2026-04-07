import { currency } from '../../utils/format'
import './ActivityFeed.css'

export default function ActivityFeed({ activity }) {
  return (
    <div className="activity">
      {activity.slice(0, 6).map((item) => (
        <div key={item.id} className="activity__item">
          <div>
            <p>
              <strong>{item.name}</strong> {item.action}
            </p>
            <span className="muted">{item.time}</span>
          </div>
          <span className="amount">{currency.format(item.amount)}</span>
        </div>
      ))}
    </div>
  )
}
