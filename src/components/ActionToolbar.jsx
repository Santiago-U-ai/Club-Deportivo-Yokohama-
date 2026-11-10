import { IconSearch } from "./Icons";

const FILTERS = ["Todos", "Al día", "Con deuda"];

export default function ActionToolbar({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  resultCount,
}) {
  return (
    <div className="toolbar">
      <label className="search-field">
        <IconSearch size={16} />
        <input
          type="search"
          placeholder="Buscar por nombre o correo"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Buscar alumno"
        />
      </label>

      <div className="filter-group" role="group" aria-label="Filtrar por estado">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={`filter-btn ${filter === option ? "active" : ""}`}
            onClick={() => setFilter(option)}
            aria-pressed={filter === option}
          >
            {option}
          </button>
        ))}
      </div>

      <span className="toolbar-count">
        {resultCount} {resultCount === 1 ? "alumno" : "alumnos"}
      </span>
    </div>
  );
}
