import { useState } from "react";
import { useAuth } from "../context/auth-context";
import "./Login.css";

const initialForm = { email: "", password: "" };

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form.email.trim(), form.password);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <aside className="auth-brand-panel">
        <img
          src="/logo-yokohama.png"
          alt="Club Deportivo Yokohama Karate"
          className="auth-logo"
        />

        <div className="auth-brand-copy">
          <p className="eyebrow">Club Deportivo Yokohama</p>
          <p className="auth-tagline">
            Disciplina.
            <br />
            Constancia.
            <br />
            Progreso.
          </p>
        </div>

        <p className="auth-brand-meta">
          Gestión de alumnos, grupos y mensualidades.
        </p>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <header className="auth-head">
            <p className="eyebrow">Acceso administrativo</p>
            <h1>Iniciar sesión</h1>
            <p className="auth-subtitle">
              Ingresa con tu cuenta de administrador para continuar.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Correo
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@correo.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="auth-hint">
            Acceso exclusivo para administradores del club. Las cuentas se crean
            desde Supabase y se promueven con el rol <code>admin</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
