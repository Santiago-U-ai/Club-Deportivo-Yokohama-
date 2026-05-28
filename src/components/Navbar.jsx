import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand fw-bold" to="/">
          Yokohama
        </Link>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-light" to="/dashboard">
            Dashboard
          </Link>
          <Link className="btn btn-outline-light" to="/dashboard#agendar-clase">
            Agendar Clase
          </Link>
          <Link className="btn btn-outline-light" to="/alumnos">
            Alumnos
          </Link>
          <Link className="btn btn-outline-light" to="/pagos">
            Pagos
          </Link>
          <Link className="btn btn-outline-light" to="/subir">
            Comprobante
          </Link>
        </div>
      </div>
    </nav>
  );
}
