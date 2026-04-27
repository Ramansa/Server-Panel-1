export function Card({ title, children }) {
  return (
    <section style={{ background: '#111827', color: '#f9fafb', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  )
}
