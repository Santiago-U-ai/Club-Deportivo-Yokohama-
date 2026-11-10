import { IconLogOut, IconUsers } from "./Icons";

const GROUPS = [
  { id: "TODOS", label: "Todos", hint: "Plantilla completa" },
  { id: "BABY", label: "Baby", hint: "4 – 7 años" },
  { id: "JUVENIL", label: "Juvenil", hint: "8 – 15 años" },
  { id: "SENIOR", label: "Senior", hint: "16+ años" },
  { id: "SIN GRUPO", label: "Sin grupo", hint: "Sin asignar" },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts = {},
  total = 0,
  userEmail,
  onLogout,
}) {
  const visibleGroups = GROUPS.filter(
    (group) => group.id !== "SIN GRUPO" || (counts["SIN GRUPO"] ?? 0) > 0,
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img
          src="/logo-yokohama.png"
          alt="Club Deportivo Yokohama Karate"
          className="brand-logo"
        />
        <p className="brand-caption">Sistema de gestión</p>
      </div>

      <nav className="side-nav" aria-label="Grupos de alumnos">
        <p className="side-nav-title">Grupos</p>

        {visibleGroups.map((group) => {
          const count = group.id === "TODOS" ? total : counts[group.id] ?? 0;
          const isActive = activeTab === group.id;

          return (
            <button
              key={group.id}
              type="button"
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(group.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="nav-item-text">
                <span className="nav-item-label">{group.label}</span>
                <span className="nav-item-hint">{group.hint}</span>
              </span>
              <span className="nav-count">{count}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="side-user">
          <span className="side-user-icon">
            <IconUsers size={16} />
          </span>
          <div className="side-user-data">
            <p className="side-user-role">Administrador</p>
            <p className="side-user-email" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <IconLogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
