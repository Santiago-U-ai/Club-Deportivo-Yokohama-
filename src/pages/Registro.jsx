import { useState } from "react";
import API from "../services/api";

export default function Registro() {

  const [form, setForm] = useState({});

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const registrar = async (e) => {

    e.preventDefault();

    await API.post("/alumnos", form);

    alert("Alumno registrado");

  };

  return (

    <div className="container mt-5">

      <h2 className="mb-4">Registro de Alumno</h2>

      <form onSubmit={registrar}>

        <div className="row">

          <div className="col-md-6 mb-3">

            <label>Nombre</label>

            <input
              name="nombre"
              className="form-control"
              onChange={handleChange}
              required
            />

          </div>

          <div className="col-md-6 mb-3">

            <label>Edad</label>

            <input
              name="edad"
              className="form-control"
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <label>Correo</label>

            <input
              name="correo"
              className="form-control"
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <label>Teléfono</label>

            <input
              name="telefono"
              className="form-control"
              onChange={handleChange}
            />

          </div>

          <div className="col-md-12 mb-3">

            <label>Dirección</label>

            <input
              name="direccion"
              className="form-control"
              onChange={handleChange}
            />

          </div>

        </div>

        <button className="btn btn-primary">
          Registrar alumno
        </button>

      </form>

    </div>

  );
}