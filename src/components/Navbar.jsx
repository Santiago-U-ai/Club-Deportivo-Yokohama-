import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout, loading } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  if (loading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            Yokohama Karate
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/">
          Yokohama 
        </Link>

        {user ? (
          <div className="user-menu-container">
            <button
              className="btn btn-user"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user.email}
            >
              <div className="user-avatar">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.email}</strong>
                  <p className="text-muted">Cuenta activa</p>
                </div>
                <hr className="my-2" />
                <Link
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  📊 Inicio
                </Link>
                <Link
                  to="/alumnos"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  👥 Alumnos
                </Link>
                <Link
                  to="/pagos"
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  💳 Pagos
                </Link>
                <hr className="my-2" />
                <button className="btn btn-logout w-100" onClick={handleLogout}>
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link className="btn btn-outline-light" to="/login">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
