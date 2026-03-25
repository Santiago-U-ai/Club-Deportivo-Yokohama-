import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    correo: "",
    password: "",
    telefono: "",
    direccion: "",
  });
  const [loginForm, setLoginForm] = useState({ correo: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Redirigir cuando el usuario está disponible (evita modificar estado durante renderizado)
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const registrar = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.correo || !form.password) {
      alert("Ingresa correo y contraseña para registrarte.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
      });

      if (error) {
        alert("Error en registro: " + error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        console.warn("Usuario registrado sin sesión inmediata:", data);
        alert(
          "Registro iniciado. Verifica tu correo para completar la confirmación.",
        );
        setLoading(false);
        return;
      }

      // Guardar alumno en backend
      try {
        const response = await API.post("/alumnos", {
          nombre: form.nombre,
          edad: form.edad,
          correo: form.correo,
          telefono: form.telefono,
          direccion: form.direccion,
          supabaseId: data.user?.id,
        });
        console.log("Alumno guardado:", response.data);
      } catch (apiError) {
        console.error(
          "Error al guardar en backend:",
          apiError.response?.data || apiError.message,
        );
        // Continúa aunque falle el backend
      }

      alert("¡Registro completado! Ya puedes iniciar sesión.");
      setIsRegister(false);
      setForm({
        nombre: "",
        edad: "",
        correo: "",
        password: "",
        telefono: "",
        direccion: "",
      });
    } catch (error) {
      alert("Error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!loginForm.correo || !loginForm.password) {
      alert("Ingresa correo y contraseña.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.correo,
        password: loginForm.password,
      });

      if (error) {
        console.error("Error en signInWithPassword:", error);
        if (error.status === 400) {
          alert(
            "Credenciales incorrectas o usuario no confirmado. Verifica tu email y contraseña.",
          );
        } else {
          alert("Error de inicio de sesión: " + error.message);
        }
        setLoading(false);
        return;
      }

      console.log("login data", data);

      if (data?.user) {
        if (data?.session) {
          alert("¡Bienvenido de vuelta!");
          navigate("/dashboard");
        } else {
          alert(
            "Registro recibido. Verifica tu correo para confirmar y luego inicia sesión.",
          );
        }
      }
    } catch (error) {
      console.error("Error inesperado en login:", error);
      alert("Error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">🥋 Karate Yokohama</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="mb-3 text-center">
            <button
              className="btn btn-link btn-lg"
              onClick={() => setIsRegister(!isRegister)}
              disabled={loading}
            >
              {isRegister
                ? "Ya tengo cuenta / Iniciar sesión"
                : "Soy nuevo / Registrar"}
            </button>
          </div>

          {isRegister ? (
            <div className="card p-4">
              <h2 className="mb-4">Crear una cuenta</h2>
              <form onSubmit={registrar}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input
                    name="correo"
                    type="email"
                    className="form-control"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <small className="text-muted">Mínimo 6 caracteres</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Edad</label>
                  <input
                    name="edad"
                    type="number"
                    className="form-control"
                    value={form.edad}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    name="telefono"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input
                    name="direccion"
                    className="form-control"
                    value={form.direccion}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar"}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-4">
              <h2 className="mb-4">Iniciar sesión</h2>
              <form onSubmit={loginEmail}>
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input
                    name="correo"
                    type="email"
                    className="form-control"
                    value={loginForm.correo}
                    onChange={handleLoginChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
