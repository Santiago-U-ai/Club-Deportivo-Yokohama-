import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Instructors from "../components/Instructors";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import "../styles/landing.css";

export default function Landing() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      {user && !loading && (
        <div className="welcome-banner">
          <div className="container">
            <div className="welcome-content">
              <div className="welcome-avatar">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="welcome-text">
                <h1>¡Hola, {user.email?.split("@")[0]}! 👋</h1>
                <p>¡ Bienvenido de vuelta a la familia Yokohama !</p>
                <div className="welcome-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/dashboard")}
                  >
                    📊 Inicio
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/alumnos")}
                  >
                    👥 Ver Alumnos
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate("/pagos")}
                  >
                    💳 Gestionar Pagos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Hero />
      <Features />
      <Instructors />
      <Footer />
    </div>
  );
}
