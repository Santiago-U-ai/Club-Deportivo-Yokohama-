import { useEffect, useMemo, useState } from "react";
import "./AddStudentModal.css";
import "./AttendanceModal.css";
import "./AttendanceHistory.css";
import { apiErrorMessage, asistenciasApi } from "../services/api";
import { formatLongDate, sedeLabel } from "../utils/adapters";
import { IconClose } from "./Icons";

const groupLabel = (grupo) =>
  !grupo || grupo === "SIN GRUPO" ? "Sin grupo" : grupo;

/**
 * Lista guardada de una clase: quiénes asistieron y quiénes faltaron.
 */
export default function AttendanceDetailModal({ clase, onClose }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    asistenciasApi
      .list({
        fecha: clase.fecha,
        hora: clase.hora,
        grupo: clase.grupo === "SIN GRUPO" ? undefined : clase.grupo,
        sede: clase.sede,
      })
      .then((data) => {
        if (cancelled) return;

        // El grupo se filtra aquí para incluir las clases sin grupo, que la
        // API no puede filtrar. Manda el grupo guardado en el registro.
        setRegistros(
          (data ?? []).filter(
            (registro) =>
              (registro.grupo ?? registro.alumnoGrupo ?? "SIN GRUPO") ===
              clase.grupo,
          ),
        );
      })
      .catch((loadError) => {
        if (!cancelled) setError(apiErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clase]);

  const presentes = useMemo(
    () => registros.filter((registro) => registro.presente),
    [registros],
  );

  const ausentes = useMemo(
    () => registros.filter((registro) => !registro.presente),
    [registros],
  );

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-content dark-modal attendance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IconClose size={18} />
        </button>

        <header className="modal-header">
          <p className="modal-eyebrow">
            Lista guardada · Grupo {groupLabel(clase.grupo)}
          </p>
          <h2 id="attendance-detail-title">{formatLongDate(clase.fecha)}</h2>
          <p className="subtitle">
            Entreno de las {clase.hora} · Sede {sedeLabel(clase.sede)}
          </p>
        </header>

        {error && <p className="banner-error">{error}</p>}

        {loading ? (
          <p className="empty-state">Cargando la lista…</p>
        ) : (
          <>
            <div className="detail-summary">
              <div className="detail-stat detail-stat-ok">
                <strong>{presentes.length}</strong>
                <span>Asistieron</span>
              </div>
              <div className="detail-stat detail-stat-warn">
                <strong>{ausentes.length}</strong>
                <span>Faltaron</span>
              </div>
              <div className="detail-stat">
                <strong>{registros.length}</strong>
                <span>En la lista</span>
              </div>
            </div>

            <div className="detail-columns">
              <section className="detail-group">
                <h3>Asistieron</h3>
                <ul className="detail-list">
                  {presentes.map((registro) => (
                    <li key={registro._id ?? registro.alumnoId}>
                      <span
                        className="detail-mark is-present"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      {registro.alumno}
                    </li>
                  ))}
                  {presentes.length === 0 && (
                    <li className="detail-empty">Nadie marcado</li>
                  )}
                </ul>
              </section>

              <section className="detail-group">
                <h3>Faltaron</h3>
                <ul className="detail-list">
                  {ausentes.map((registro) => (
                    <li key={registro._id ?? registro.alumnoId}>
                      <span
                        className="detail-mark is-absent"
                        aria-hidden="true"
                      >
                        ✕
                      </span>
                      {registro.alumno}
                    </li>
                  ))}
                  {ausentes.length === 0 && (
                    <li className="detail-empty">Sin ausencias</li>
                  )}
                </ul>
              </section>
            </div>
          </>
        )}

        <div className="modal-actions detail-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
