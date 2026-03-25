import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

export default function Pagos() {

  const { id } = useParams();

  const [pagos, setPagos] = useState([]);

  useEffect(() => {

    API.get(`/pagos/${id}`)
      .then(res => setPagos(res.data));

  }, []);

  return (

    <div className="container mt-5">

      <h2>Historial de Pagos</h2>

      <table className="table table-bordered">

        <thead>

          <tr>
            <th>Mes</th>
            <th>Valor</th>
            <th>Estado</th>
          </tr>

        </thead>

        <tbody>

          {pagos.map(p => (

            <tr key={p._id}>

              <td>{p.mes}</td>
              <td>${p.valor}</td>
              <td>{p.estado}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}