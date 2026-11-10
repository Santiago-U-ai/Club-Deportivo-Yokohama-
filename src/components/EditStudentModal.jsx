import { useState } from "react";
import "./AddStudentModal.css";
import { BELTS, GROUPS } from "../utils/adapters";
import { IconClose } from "./Icons";

export default function EditStudentModal({ student, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: student.name,
    correo: student.correo,
    phone: student.phone,
    age: student.age ?? "",
    direccion: student.direccion,
    belt: student.belt,
    group: student.group === "SIN GRUPO" ? "" : student.group,
    isActive: student.activo,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(student.id, formData);
      onClose();
    } catch (submitError) {
      setError(submitError.message || "No se pudo actualizar el alumno");
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
          <p className="modal-eyebrow">Datos del alumno</p>
          <h2>Editar alumno</h2>
          <p className="subtitle">{student.name}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              placeholder="alumno@correo.com"
              value={formData.correo}
              onChange={(event) => update("correo", event.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Edad</label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.age}
                onChange={(event) => update("age", event.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                placeholder="300 000 0000"
                value={formData.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Grupo</label>
              <select
                value={formData.group}
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
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Calle 1 # 2-3"
                value={formData.direccion}
                onChange={(event) => update("direccion", event.target.value)}
              />
            </div>
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
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
