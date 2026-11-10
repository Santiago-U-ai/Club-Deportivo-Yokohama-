import "./App.css";
import { useAuth } from "./context/auth-context";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const { session, role, loading, logout, reloadProfile } = useAuth();

  if (loading) {
    return <p className="app-splash">Cargando sistema...</p>;
  }

  if (!session) {
    return <Login />;
  }

  if (!role) {
    return (
      <div className="app-splash">
        <p>No se pudo cargar tu perfil.</p>
        <div className="splash-actions">
          <button type="button" onClick={() => reloadProfile()}>
            Reintentar
          </button>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="app-splash">
        <p>Esta aplicación es exclusiva para administradores.</p>
        <div className="splash-actions">
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
