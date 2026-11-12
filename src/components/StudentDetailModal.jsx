import "./AddStudentModal.css";
import "./StudentDetailModal.css";
import { formatShortDate, monthLabel, sedeLabel } from "../utils/adapters";
import { IconClose } from "./Icons";

const money = (value) => `$${Number(value ?? 0).toLocaleString("es-CO")}`;

const deudaTexto = (student) => {
  if (student.alDia) return "Sin deudas pendientes";
  if (!student.mesDeuda) return "Sin cobro generado";

  const meses = student.mesesPendientes.length;

  if (meses <= 1) return `Debe ${monthLabel(student.mesDeuda)}`;
  return `Debe desde ${monthLabel(student.mesDeuda)} · ${meses} meses`;
};

export default function StudentDetailModal({
  student,
  onClose,
  onEdit,
  onHistory,
}) {
  if (!student) return null;

  const edad =
    student.age === null || student.age === undefined
      ? "—"
      : `${student.age} ${student.age === 1 ? "año" : "años"}`;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content dark-modal detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IconClose size={18} />
        </button>

        <header className="detail-header">
          <div className="avatar detail-avatar">{student.initials || "?"}</div>

          <div className="modal-header detail-identity">
            <p className="modal-eyebrow">
              Ficha del alumno · Sede {sedeLabel(student.sede)}
            </p>
            <h2 id="detail-title">{student.name}</h2>

            <div className="detail-tags">
              {student.group === "SIN GRUPO" ? (
                <span className="group-tag muted">Sin grupo</span>
              ) : (
                <span className="group-tag">{student.group}</span>
              )}

              <span className="belt-badge">
                <span
                  className="belt-dot"
                  style={{ backgroundColor: student.beltColor }}
                />
                {student.belt}
              </span>

              <span className={student.alDia ? "status-active" : "status-pending"}>
                {student.alDia ? "Al día" : "Pendiente"}
              </span>

              {!student.activo && (
                <span className="detail-chip">Inactivo</span>
              )}
            </div>
          </div>
        </header>

        <section className="detail-section">
          <h3>Contacto</h3>

          <dl className="detail-grid">
            <div className="detail-wide">
              <dt>Correo</dt>
              <dd>{student.correo || "—"}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{student.phone || "—"}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{student.direccion || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-section">
          <h3>Trayectoria</h3>

          <dl className="detail-grid">
            <div>
              <dt>Fecha de nacimiento</dt>
              <dd>{formatShortDate(student.birthDate)}</dd>
            </div>
            <div>
              <dt>Edad</dt>
              <dd>{edad}</dd>
            </div>
            <div>
              <dt>Inicio en karate</dt>
              <dd>{formatShortDate(student.startDate)}</dd>
            </div>
            <div>
              <dt>Tiempo en el club</dt>
              <dd>{student.karateTime || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-section">
          <div className="detail-section-head">
            <h3>Mensualidad</h3>
            <button
              type="button"
              className="detail-link"
              onClick={() => onHistory(student)}
            >
              Ver historial
            </button>
          </div>

          <div className="detail-payment">
            <div>
              <p className="detail-amount">{money(student.deudaTotal)}</p>
              <p className="detail-amount-label">Deuda total</p>
            </div>

            <div className="detail-payment-meta">
              <p>{deudaTexto(student)}</p>
              <p>
                Último pago:{" "}
                {student.lastPaymentDate
                  ? formatShortDate(student.lastPaymentDate)
                  : "sin registros"}
              </p>
            </div>
          </div>
        </section>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={() => onEdit(student)}
          >
            Editar alumno
          </button>
        </div>
      </div>
    </div>
  );
}
