import { useEffect, useMemo, useState } from "react";
import "./AttendanceHistory.css";
import { apiErrorMessage, asistenciasApi } from "../services/api";
import {
  GROUPS,
  formatShortDate,
  sedeLabel,
  todayISO,
} from "../utils/adapters";
import AttendanceDetailModal from "./AttendanceDetailModal";
import { IconClipboardCheck } from "./Icons";

const firstDayOfMonth = () => `${todayISO().slice(0, 7)}-01`;

const groupLabel = (grupo) =>
  !grupo || grupo === "SIN GRUPO" ? "Sin grupo" : grupo;

/**
 * Apartado «Listas guardadas»: cada clase con lista registrada, agrupada
 * por día, con acceso al detalle de asistentes y ausentes.
 */
export default function AttendanceHistory({ sede }) {
  const [desde, setDesde] = useState(firstDayOfMonth);
  const [hasta, setHasta] = useState(todayISO);
  const [grupo, setGrupo] = useState("");
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    if (!desde || !hasta || desde > hasta) return undefined;

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      if (cancelled) return;

      setLoading(true);

      try {
        const data = await asistenciasApi.clases({
          desde,
          hasta,
          sede,
          grupo: grupo || undefined,
          limit: 100,
        });

        if (cancelled) return;

        setClases(Array.isArray(data) ? data : []);
        setError("");
      } catch (loadError) {
        if (cancelled) return;
        setError(apiErrorMessage(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [desde, hasta, grupo, sede, retryKey]);

  const porDia = useMemo(() => {
    const dias = new Map();

    for (const clase of clases) {
      const lista = dias.get(clase.fecha) ?? [];
      lista.push(clase);
      dias.set(clase.fecha, lista);
    }

    return [...dias.entries()];
  }, [clases]);

  const rangoInvalido = desde && hasta && desde > hasta;

  return (
    <div className="history">
      <section className="panel" aria-label="Filtros de las listas guardadas">
        <div className="history-filters">
          <div className="history-field">
            <label htmlFor="history-desde">Desde</label>
            <input
              id="history-desde"
              type="date"
              value={desde}
              max={hasta || todayISO()}
              onChange={(event) => setDesde(event.target.value)}
            />
          </div>

          <div className="history-field">
            <label htmlFor="history-hasta">Hasta</label>
            <input
              id="history-hasta"
              type="date"
              value={hasta}
              min={desde}
              max={todayISO()}
              onChange={(event) => setHasta(event.target.value)}
            />
          </div>

          <div className="history-field">
            <label htmlFor="history-grupo">Grupo</label>
            <select
              id="history-grupo"
              value={grupo}
              onChange={(event) => setGrupo(event.target.value)}
            >
              <option value="">Todos</option>
              {GROUPS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="SIN GRUPO">Sin grupo</option>
            </select>
          </div>

          <p className="history-count" role="status">
            {rangoInvalido
              ? "El rango está invertido"
              : loading
                ? "Buscando…"
                : `${clases.length} ${clases.length === 1 ? "clase" : "clases"}`}
          </p>
        </div>
      </section>

      {error && (
        <p className="banner-error">
          {error}
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
          >
            Reintentar
          </button>
        </p>
      )}

      {!rangoInvalido && loading && (
        <p className="empty-state">Cargando listas guardadas…</p>
      )}

      {!rangoInvalido && !loading && clases.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">Sin listas guardadas</p>
          <p>
            No hay clases con asistencia registrada en este rango para la sede{" "}
            {sedeLabel(sede)}. Cambia las fechas o abre la llamada a lista desde
            un grupo.
          </p>
        </div>
      )}

      {!rangoInvalido && !loading && clases.length > 0 && (
        <div className="history-days">
          {porDia.map(([fecha, lista]) => {
            const presentes = lista.reduce(
              (total, clase) => total + clase.presentes,
              0,
            );

            return (
              <section
                key={fecha}
                className="panel history-day"
                aria-label={`Listas del ${formatShortDate(fecha)}`}
              >
                <header className="history-day-head">
                  <h2>{formatShortDate(fecha)}</h2>
                  <span className="history-day-meta">
                    {lista.length} {lista.length === 1 ? "clase" : "clases"} ·{" "}
                    {presentes} presentes
                  </span>
                </header>

                <div className="history-classes">
                  {lista.map((clase) => {
                    const porcentaje =
                      clase.total > 0
                        ? Math.round((clase.presentes / clase.total) * 100)
                        : 0;

                    return (
                      <button
                        key={`${clase.fecha}-${clase.hora}-${clase.sede}-${clase.grupo}`}
                        type="button"
                        className="history-class"
                        onClick={() => setSeleccion(clase)}
                        aria-label={`Ver la lista de ${groupLabel(clase.grupo)} del ${formatShortDate(fecha)} a las ${clase.hora}`}
                      >
                        <span className="history-class-time">
                          {clase.hora}
                        </span>

                        <span className="history-class-info">
                          <span className="history-class-group">
                            {groupLabel(clase.grupo)}
                          </span>
                          <span className="history-class-sede">
                            Sede {sedeLabel(clase.sede)}
                          </span>
                        </span>

                        <span className="history-class-meter">
                          <span className="history-class-count">
                            {clase.presentes}/{clase.total}
                          </span>
                          <span
                            className="history-class-bar"
                            aria-hidden="true"
                          >
                            <span style={{ width: `${porcentaje}%` }} />
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="history-foot">
        <IconClipboardCheck size={14} />
        Abre una clase para ver quiénes asistieron y quiénes faltaron.
      </p>

      {seleccion && (
        <AttendanceDetailModal
          key={`${seleccion.fecha}-${seleccion.hora}-${seleccion.sede}-${seleccion.grupo}`}
          clase={seleccion}
          onClose={() => setSeleccion(null)}
        />
      )}
    </div>
  );
}
