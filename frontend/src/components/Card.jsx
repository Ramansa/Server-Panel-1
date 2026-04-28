export function Card({ title, subtitle, children, actions }) {
  return (
    <section className="panel-card">
      <header className="panel-card__header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="panel-card__actions">{actions}</div>}
      </header>
      <div className="panel-card__body">{children}</div>
    </section>
  )
}
