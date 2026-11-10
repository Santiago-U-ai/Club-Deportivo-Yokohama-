const money = (value) =>
  `$${Number(value ?? 0).toLocaleString("es-CO")}`;

export default function StatsBar({ stats, deudaTotal = 0 }) {
  const items = [
    { id: "total", label: "Alumnos", value: stats.total, tone: "neutral" },
    { id: "al-dia", label: "Al día", value: stats.alDia, tone: "ok" },
    { id: "pendientes", label: "Pendientes", value: stats.pendientes, tone: "warn" },
    { id: "deuda", label: "Deuda total", value: money(deudaTotal), tone: "debt" },
  ];

  return (
    <section className="stats-bar" aria-label="Resumen del club">
      {items.map((item) => (
        <div key={item.id} className={`stat stat-${item.tone}`}>
          <span className="stat-label">{item.label}</span>
          <strong className="stat-value">{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
