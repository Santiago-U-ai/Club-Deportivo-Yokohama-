import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { getStudentData, getStudentPayments } from "../services/api";
import "../styles/landing.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, paymentsRes] = await Promise.all([
          getStudentData(),
          getStudentPayments(),
        ]);

        let alumnoData = studentRes.data;
        if (Array.isArray(alumnoData)) {
          alumnoData = alumnoData.find((item) => item.supabaseId === user?.id);
        }

        let pagoData = paymentsRes.data;
        if (Array.isArray(pagoData) && alumnoData) {
          pagoData = pagoData.filter((p) => p.alumno === alumnoData.nombre);
        }

        setStudent(alumnoData);
        setPayments(pagoData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <div className="content">Cargando...</div>;
  }

  if (!student) {
    return <div className="content">No se encontró información del alumno</div>;
  }

  // Calcular meses de deuda y valor a deber
  const pendingPayments = payments.filter((p) => p.estado === "pendiente");
  const monthsDebt = pendingPayments.map((p) => p.mes);
  const amountOwed = pendingPayments.reduce(
    (sum, p) => sum + (p.monto || 500),
    0,
  );

  // Horarios de entrenamiento (asumiendo horarios fijos)
  const trainingSchedules = [
    { day: "Lunes", time: "18:00 - 20:00" },
    { day: "Miércoles", time: "18:00 - 20:00" },
    { day: "Viernes", time: "18:00 - 20:00" },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="welcome-banner">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">Dashboard - {student.nombre}</h1>
            <p className="col-md-8 fs-4">
              Bienvenido al panel de control. Aquí puedes ver tus pagos, deudas
              y horarios de entrenamiento.
            </p>
          </div>
        </div>

        <div className="row text-center mb-4">
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-primary shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">Pagos pendientes</h5>
                <p className="card-text fs-2 font-weight-bold">
                  {pendingPayments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-primary shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">Meses de deuda</h5>
                <p className="card-text fs-2 font-weight-bold">
                  {monthsDebt.length ? monthsDebt.join(", ") : "Sin deudas"}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-primary shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">Valor a deber</h5>
                <p className="card-text fs-2 font-weight-bold">
                  ${amountOwed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {/* Horarios de Entrenamiento */}
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Horarios de Entrenamiento</h3>
            <ul>
              {trainingSchedules.map((schedule, index) => (
                <li key={index}>
                  <strong>{schedule.day}:</strong> {schedule.time}
                </li>
              ))}
            </ul>
          </div>

          {/* Meses de Deuda */}
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Meses de Deuda</h3>
            {monthsDebt.length > 0 ? (
              <ul>
                {monthsDebt.map((month, index) => (
                  <li key={index}>{month}</li>
                ))}
              </ul>
            ) : (
              <p>No hay deudas pendientes</p>
            )}
          </div>

          {/* Valor a Deber */}
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Valor a Deber</h3>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: amountOwed > 0 ? "red" : "green",
              }}
            >
              ${amountOwed.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
