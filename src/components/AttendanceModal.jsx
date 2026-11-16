import { useEffect, useMemo, useState } from "react";
import "./AddStudentModal.css";
import "./AttendanceModal.css";
import { apiErrorMessage, asistenciasApi } from "../services/api";
import { currentTime, formatShortDate, sedeLabel, todayISO } from "../utils/adapters";
import { IconClipboardCheck, IconClose } from "./Icons";

/**
 * Llamar a lista de un grupo: fecha y hora del entreno, y un check por
 * alumno. Al guardar se envía la lista completa, de modo que quien no
 * está marcado queda como ausente.
 */
export default function AttendanceModal({ group, sede, students = [], onClose }) {
  const [fecha, setFecha] = useState(todayISO);
  const [hora, setHora] = useState(currentTime);
  const [presentes, setPresentes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const hoy = todayISO();

  const presentesCount = useMemo(
    () => students.filter((student) => Boolean(presentes[student.id])).length,
    [students, presentes],
  );

  const yaRegistrada = useMemo(
    () => students.some((student) => presentes[student.id] !== undefined),
    [students, presentes],
  );

  // Carga lo que ya estuviera registrado para ese día y hora. Se espera un
  // poco antes de consultar para no disparar una petición por cada tecla.
  useEffect(() => {
    if (!fecha || !hora) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setSaved("");

    const timer = window.setTimeout(() => {
      asistenciasApi
        .list({ fecha, hora, grupo: group, sede })
        .then((data) => {
          if (cancelled) return;

          const mapa = {};
          for (const registro of data ?? []) {
            mapa[registro.alumnoId] = Boolean(registro.presente);
          }

          setPresentes(mapa);
          setError("");
        })
        .catch((loadError) => {
          if (cancelled) return;
          setError(apiErrorMessage(loadError));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [fecha, hora, group, sede]);

  const toggle = (alumnoId) => {
    setSaved("");
    setPresentes((prev) => ({ ...prev, [alumnoId]: !prev[alumnoId] }));
  };

  const marcarTodos = (valor) => {
    setSaved("");
    setPresentes(
      students.reduce((acc, student) => {
        acc[student.id] = valor;
        return acc;
      }, {}),
    );
  };

  const handleSave = async () => {
    if (!fecha || !hora) {
      setError("Indica la fecha y la hora del entreno");
      return;
    }

    if (students.length === 0) {
      setError("Este grupo no tiene alumnos activos en la sede");
      return;
    }

    if (
      presentesCount === 0 &&
      !window.confirm(
        `No marcaste a ningún alumno de ${group}. ¿Guardar la lista así?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSaved("");

    try {
      await asistenciasApi.save({
        fecha,
        hora,
        registros: students.map((student) => ({
          alumno_id: student.id,
          presente: Boolean(presentes[student.id]),
        })),
      });

      setSaved(
        `Lista guardada: ${presentesCount} de ${students.length} presentes el ${formatShortDate(fecha)} a las ${hora}.`,
      );
    } catch (saveError) {
      setError(apiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-content dark-modal attendance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-title"
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
          <p className="modal-eyebrow">Llamar a lista · Grupo {group}</p>
          <h2 id="attendance-title">Asistencia</h2>
          <p className="subtitle">
            Sede {sedeLabel(sede)} · {students.length}{" "}
            {students.length === 1 ? "alumno activo" : "alumnos activos"}
          </p>
        </header>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="attendance-fecha">Día del entreno</label>
            <input
              id="attendance-fecha"
              type="date"
              value={fecha}
              max={hoy}
              onChange={(event) => setFecha(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="attendance-hora">Hora</label>
            <input
              id="attendance-hora"
              type="time"
              value={hora}
              onChange={(event) => setHora(event.target.value)}
            />
          </div>
        </div>

        <p className="attendance-hint">
          {yaRegistrada
            ? "Ya hay una lista guardada para este día y hora: los cambios la actualizan."
            : "Lista nueva: marca a los alumnos que asistieron al entreno."}
        </p>

        <div className="attendance-toolbar">
          <span className="attendance-counter">
            <strong>{presentesCount}</strong> / {students.length} presentes
          </span>
          <div className="attendance-bulk">
            <button
              type="button"
              onClick={() => marcarTodos(true)}
              disabled={loading || students.length === 0}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => marcarTodos(false)}
              disabled={loading || students.length === 0}
            >
              Ninguno
            </button>
          </div>
        </div>

        {error && <p className="banner-error">{error}</p>}
        {saved && <p className="attendance-banner">{saved}</p>}

        {students.length === 0 ? (
          <p className="empty-state">
            No hay alumnos activos de {group} en la sede {sedeLabel(sede)}.
          </p>
        ) : (
          <ul className="attendance-list" aria-busy={loading}>
            {students.map((student) => {
              const isPresent = Boolean(presentes[student.id]);

              return (
                <li key={student.id}>
                  <label
                    className={`attendance-row ${isPresent ? "is-present" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => toggle(student.id)}
                    />
                    <span className="attendance-name">{student.name}</span>
                    <span className="attendance-belt">{student.belt}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <p className="attendance-status" role="status">
          {loading
            ? "Buscando registros de este día…"
            : `Entreno del ${formatShortDate(fecha)}${hora ? ` a las ${hora}` : ""}`}
        </p>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
          >
            <IconClipboardCheck size={15} />
            {saving ? "Guardando…" : "Guardar lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
