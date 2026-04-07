import './NotificationCenter.css'

export default function NotificationCenter({ notifications, onDismiss, onOpenAuction }) {
  if (!notifications.length) return null

  return (
    <section className="notification-center" aria-live="polite" aria-label="Notifications">
      {notifications.map((notification) => (
        <article key={notification.id} className="notification-card" role="status">
          <div className="notification-copy">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
          </div>

          <div className="notification-actions">
            {notification.auctionId ? (
              <button
                type="button"
                className="notification-btn notification-btn--primary"
                onClick={() => onOpenAuction(notification.auctionId)}
              >
                View auction
              </button>
            ) : null}
            <button
              type="button"
              className="notification-btn notification-btn--ghost"
              onClick={() => onDismiss(notification.id)}
            >
              Dismiss
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}
