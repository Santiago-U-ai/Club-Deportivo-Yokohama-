import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alumnos from "./pages/Alumnos";
import Pagos from "./pages/Pagos";
import SubirComprobante from "./pages/SubirComprobante";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/subir" element={<SubirComprobante />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
