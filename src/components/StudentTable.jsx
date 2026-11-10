import React from "react";
import { formatDate, monthLabel } from "../utils/adapters";
import {
  IconCheck,
  IconEdit,
  IconHistory,
  IconTrash,
  IconUndo,
} from "./Icons";

const deudaLabel = (student) => {
  if (!student.mesDeuda) return "Sin cobro del mes";

  const meses = student.mesesPendientes.length;

  if (meses <= 1) return `Debe ${monthLabel(student.mesDeuda)}`;

  return `Debe desde ${monthLabel(student.mesDeuda)} · ${meses} meses`;
};

const metaLine = (student) => {
  const parts = [];
  if (student.age) parts.push(`${student.age} años`);
  if (student.phone) parts.push(student.phone);
  if (parts.length === 0) parts.push(student.correo || "Sin contacto");
  return parts.join(" · ");
};

export default function StudentTable({
  students,
  onDelete,
  onEdit,
  onHistory,
  onToggleMensualidad,
  busyId,
}) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No hay alumnos en esta vista</p>
        <p>Ajusta la búsqueda o registra un alumno con «Añadir alumno».</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="student-table main-table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Grupo</th>
            <th>Cinturón</th>
            <th>Último pago</th>
            <th>Estado</th>
            <th className="th-actions">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <div className="student-info">
                  <div className="avatar">{student.initials}</div>
                  <div className="student-data">
                    <p className="student-name">{student.name}</p>
                    <p className="student-phone">{metaLine(student)}</p>
                  </div>
                </div>
              </td>
              <td data-label="Grupo">
                {student.group === "SIN GRUPO" ? (
                  <span className="group-tag muted">Sin grupo</span>
                ) : (
                  <span className="group-tag">{student.group}</span>
                )}
                {!student.activo && <span className="inactive-tag">Inactivo</span>}
              </td>
              <td data-label="Cinturón">
                <span className="belt-badge">
                  <span
                    className="belt-dot"
                    style={{ backgroundColor: student.beltColor }}
                  />
                  {student.belt}
                </span>
              </td>
              <td className="payment-date" data-label="Último pago">
                {formatDate(student.lastPaymentDate)}
              </td>
              <td data-label="Estado">
                <span
                  className={
                    student.alDia ? "status-active font-bold" : "status-pending"
                  }
                >
                  {student.alDia ? "Al día" : "Pendiente"}
                </span>
                {!student.alDia && (
                  <span
                    className="debt-month"
                    title={`Deuda: $${student.deudaTotal.toLocaleString("es-CO")}`}
                  >
                    {deudaLabel(student)}
                  </span>
                )}
              </td>
              <td className="action-btns">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onEdit(student)}
                  disabled={busyId === student.id}
                  title="Editar alumno"
                  aria-label={`Editar a ${student.name}`}
                >
                  <IconEdit size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn history-btn"
                  onClick={() => onHistory(student)}
                  disabled={busyId === student.id}
                  title="Ver historial de mensualidades"
                  aria-label={`Ver historial de ${student.name}`}
                >
                  <IconHistory size={16} />
                </button>
                <button
                  type="button"
                  className={`icon-btn ${
                    student.pagadoMesActual ? "undo-btn" : "pay-btn"
                  }`}
                  onClick={() => onToggleMensualidad(student)}
                  disabled={busyId === student.id}
                  title={
                    student.pagadoMesActual
                      ? "Marcar la mensualidad del mes actual como pendiente"
                      : "Marcar la mensualidad del mes actual como pagada"
                  }
                  aria-label={
                    student.pagadoMesActual
                      ? `Marcar pendiente el mes actual de ${student.name}`
                      : `Marcar al día a ${student.name}`
                  }
                >
                  {student.pagadoMesActual ? (
                    <IconUndo size={16} />
                  ) : (
                    <IconCheck size={16} />
                  )}
                </button>
                <button
                  type="button"
                  className="icon-btn danger-btn"
                  onClick={() => onDelete(student)}
                  disabled={busyId === student.id}
                  title="Eliminar alumno"
                  aria-label={`Eliminar a ${student.name}`}
                >
                  <IconTrash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
