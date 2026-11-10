import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage, pagosApi } from "../services/api";
import { currentMonth, formatDate, monthLabel } from "../utils/adapters";
import { IconClose, IconTrash } from "./Icons";
import "./StudentHistoryModal.css";

export default function StudentHistoryModal({
  student,
  onClose,
  onSave,
  onDeletePago,
}) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mes, setMes] = useState(student.mesDeuda ?? currentMonth());
  const [monto, setMonto] = useState(500);
  const [estado, setEstado] = useState("pagado");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const data = await pagosApi.byAlumno(student.id);
    setPagos(data ?? []);
  };

  useEffect(() => {
    let active = true;

    pagosApi
      .byAlumno(student.id)
      .then((data) => {
        if (active) setPagos(data ?? []);
      })
      .catch((loadError) => {
        if (active) setError(apiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [student.id]);

  // Al elegir un mes que ya tiene registro, precarga monto y estado
  // para no sobrescribirlos por accidente.
  useEffect(() => {
    const existente = pagos.find((pago) => pago.mes === mes);
    if (!existente) return;

    setMonto(Number(existente.monto ?? 0));
    setEstado(existente.estado === "pagado" ? "pagado" : "pendiente");
  }, [mes, pagos]);

  const resumen = useMemo(() => {
    const mesActual = currentMonth();
    const pagados = pagos.filter((pago) => pago.estado === "pagado");
    const pendientes = pagos
      .filter((pago) => pago.estado !== "pagado" && pago.mes <= mesActual)
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      pagados: pagados.length,
      pendientes: pendientes.length,
      total: pagados.reduce((sum, pago) => sum + Number(pago.monto ?? 0), 0),
      mesDeuda: pendientes[0]?.mes ?? null,
    };
  }, [pagos]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(student.id, {
        mes,
        monto: Number(monto),
        estado,
      });
      await load();
    } catch (saveError) {
      setError(apiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (pago) => {
    const nuevoEstado = pago.estado === "pagado" ? "pendiente" : "pagado";

    if (
      nuevoEstado === "pendiente" &&
      !window.confirm(`¿Marcar ${monthLabel(pago.mes)} como pendiente?`)
    ) {
      return;
    }

    setError("");
    setBusyId(pago.id);

    try {
      await onSave(student.id, { mes: pago.mes, estado: nuevoEstado });
      await load();
    } catch (toggleError) {
      setError(apiErrorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (pago) => {
    const confirmed = window.confirm(
      `¿Eliminar el registro de ${monthLabel(pago.mes)}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError("");
    setBusyId(pago.id);

    try {
      await onDeletePago(pago.id);
      await load();
    } catch (deleteError) {
      setError(apiErrorMessage(deleteError));
    } finally {
      setBusyId(null);
    }
  };

  const openComprobante = async (pagoId) => {
    setError("");

    try {
      const { comprobanteUrl } = await pagosApi.comprobanteUrl(pagoId);
      window.open(comprobanteUrl, "_blank", "noopener,noreferrer");
    } catch (openError) {
      setError(apiErrorMessage(openError));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content dark-modal history-modal">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IconClose size={18} />
        </button>

        <div className="modal-header">
          <p className="modal-eyebrow">Mensualidades</p>
          <h2>Historial de mensualidades</h2>
          <p className="subtitle">
            {student.name} · {student.group === "SIN GRUPO" ? "Sin grupo" : student.group}
            {" · "}
            {resumen.mesDeuda
              ? `Debe desde ${monthLabel(resumen.mesDeuda)}`
              : "Sin deudas"}
          </p>
        </div>

        <div className="history-summary">
          <div>
            <strong>{resumen.pagados}</strong>
            <span>Meses pagados</span>
          </div>
          <div>
            <strong>{resumen.pendientes}</strong>
            <span>Pendientes</span>
          </div>
          <div>
            <strong>${resumen.total.toLocaleString("es-CO")}</strong>
            <span>Total recibido</span>
          </div>
        </div>

        <form className="history-form" onSubmit={handleSave}>
          <div className="form-group">
            <label>Mes</label>
            <input
              type="month"
              required
              value={mes}
              onChange={(event) => setMes(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={monto}
              onChange={(event) => setMonto(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
            >
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </form>

        {error && <p className="form-error">{error}</p>}

        <div className="history-list">
          {loading ? (
            <p className="empty-state">Cargando historial...</p>
          ) : pagos.length === 0 ? (
            <p className="empty-state">
              Este alumno todavía no tiene mensualidades registradas.
            </p>
          ) : (
            <table className="student-table history-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha pago</th>
                  <th>Comprobante</th>
                  <th className="th-actions">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>{monthLabel(pago.mes)}</td>
                    <td>${Number(pago.monto ?? 0).toLocaleString("es-CO")}</td>
                    <td>
                      <span
                        className={
                          pago.estado === "pagado"
                            ? "status-active font-bold"
                            : "status-pending"
                        }
                      >
                        {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="payment-date">
                      {pago.estado === "pagado"
                        ? formatDate(pago.fecha_pago)
                        : "—"}
                    </td>
                    <td>
                      {pago.comprobante ? (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => openComprobante(pago.id)}
                        >
                          Ver
                        </button>
                      ) : (
                        <span className="student-meta">—</span>
                      )}
                    </td>
                    <td className="action-btns">
                      <button
                        type="button"
                        className={`mini-btn ${pago.estado === "pagado" ? "undo-btn" : "pay-btn"}`}
                        onClick={() => toggleEstado(pago)}
                        disabled={busyId === pago.id}
                      >
                        {pago.estado === "pagado" ? "Marcar pendiente" : "Marcar pagado"}
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger-btn"
                        onClick={() => handleDelete(pago)}
                        disabled={busyId === pago.id}
                        title="Eliminar este registro"
                        aria-label={`Eliminar el registro de ${monthLabel(pago.mes)}`}
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-actions history-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
