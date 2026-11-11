import { useState } from "react";
import "./AddStudentModal.css";
import { BELTS, GROUPS, todayISO } from "../utils/adapters";
import { IconClose } from "./Icons";

const initialForm = {
  name: "",
  correo: "",
  phone: "",
  birthDate: "",
  startDate: "",
  belt: "BLANCO",
  isActive: true,
};

export default function AddStudentModal({ isOpen, onClose, onAdd, activeTab }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const selectedGroup =
    formData.group ?? (GROUPS.includes(activeTab) ? activeTab : "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onAdd({
        name: formData.name,
        correo: formData.correo,
        phone: formData.phone,
        birthDate: formData.birthDate,
        startDate: formData.startDate,
        belt: formData.belt,
        group: selectedGroup || undefined,
        isActive: formData.isActive,
      });

      setFormData(initialForm);
      onClose();
    } catch (submitError) {
      setError(submitError.message || "No se pudo registrar el alumno");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content dark-modal">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <IconClose size={18} />
        </button>

        <div className="modal-header">
          <p className="modal-eyebrow">Alta de alumno</p>
          <h2>Nuevo alumno</h2>
          <p className="subtitle">
            {selectedGroup ? `Grupo ${selectedGroup}` : "Sin grupo asignado"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez García"
              required
              value={formData.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Correo (opcional)</label>
            <input
              type="email"
              placeholder="alumno@correo.com"
              value={formData.correo}
              onChange={(event) => update("correo", event.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
                min="1900-01-01"
                max={todayISO()}
                required
                value={formData.birthDate}
                onChange={(event) => update("birthDate", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Inicio en karate</label>
              <input
                type="date"
                min="1900-01-01"
                max={todayISO()}
                value={formData.startDate}
                onChange={(event) => update("startDate", event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              placeholder="300 000 0000"
              required
              value={formData.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Grupo</label>
            <select
              value={selectedGroup}
              onChange={(event) => update("group", event.target.value)}
            >
              <option value="">Sin grupo</option>
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cinturón</label>
            <div className="belt-selector">
              {BELTS.map((belt) => (
                <button
                  key={belt.id}
                  type="button"
                  className={`belt-btn ${formData.belt === belt.id ? "selected" : ""}`}
                  style={{ color: belt.color }}
                  onClick={() => update("belt", belt.id)}
                >
                  {belt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="toggle-group">
            <label className="switch">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span className="toggle-label">Alumno activo</span>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Guardando…" : "Guardar alumno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
