import { useState } from "react";

const initialForm = {
  subject: "",
  instructor: "",
  date: "",
  time: "",
  duration: "60",
  notes: "",
};

export default function ScheduleClass() {
  const [form, setForm] = useState(initialForm);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.subject || !form.date || !form.time) {
      setError(
        "Por favor completa los campos obligatorios: clase, fecha y hora.",
      );
      setMessage(null);
      return;
    }

    const newAppointment = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setMessage("Tu clase personalizada ha sido agendada con éxito.");
    setError(null);
    setForm(initialForm);
  };

  return (
    <section
      id="agendar-clase"
      className="schedule-section card mb-4 shadow-sm border-primary"
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row gap-3">
          <div>
            <h2 className="h4">Agendar Clase Personalizada</h2>
            <p className="text-muted mb-0">
              Completa el siguiente formulario para solicitar una clase
              personalizada con tu instructor.
            </p>
          </div>
          <span className="badge bg-primary text-white align-self-start">
            Nuevo
          </span>
        </div>

        {message && <div className="alert alert-success mt-3">{message}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <form onSubmit={handleSubmit} className="row g-3 mt-3">
          <div className="col-md-6">
            <label htmlFor="subject" className="form-label">
              Tipo de clase
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej. Defensa personal, kata, kumite"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="instructor" className="form-label">
              Instructor preferido
            </label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={form.instructor}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej. Sensei Juan"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="date" className="form-label">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="time" className="form-label">
              Hora
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="duration" className="form-label">
              Duración
            </label>
            <select
              id="duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="form-select"
            >
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <div className="col-12">
            <label htmlFor="notes" className="form-label">
              Comentarios o enfoque deseado
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Describe qué quieres trabajar en la clase"
            />
          </div>

          <div className="col-12 text-end">
            <button type="submit" className="btn btn-primary">
              Agendar Clase
            </button>
          </div>
        </form>

        {appointments.length > 0 && (
          <div className="mt-4">
            <h3 className="h5">Clases agendadas</h3>
            <div className="list-group">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="list-group-item list-group-item-action mb-2"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h4 className="h6 mb-1">{appointment.subject}</h4>
                      <p className="mb-1 text-muted">
                        {appointment.notes || "Sin comentarios adicionales"}
                      </p>
                      <p className="mb-0">
                        <strong>Fecha:</strong> {appointment.date} |{" "}
                        <strong>Hora:</strong> {appointment.time} |{" "}
                        <strong>Duración:</strong> {appointment.duration} min
                      </p>
                    </div>
                    <span className="badge bg-secondary">
                      {appointment.instructor || "Cualquier instructor"}
                    </span>
                  </div>
                  <small className="text-muted">
                    Solicitada: {appointment.createdAt}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
