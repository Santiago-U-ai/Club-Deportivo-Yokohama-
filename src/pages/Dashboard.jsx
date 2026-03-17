import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"

export default function Dashboard(){

const [stats,setStats] = useState({
alumnos:0,
ingresos:0,
pendientes:0,
vencimientos:0
})

const [alumnos,setAlumnos] = useState([])

useEffect(()=>{

cargarDatos()

},[])

const cargarDatos = async()=>{

try{

const res = await axios.get("http://localhost:5000/api/dashboard")

setStats(res.data.stats)
setAlumnos(res.data.alumnos)

}catch(err){

console.log(err)

}

}

return(

<div>

<Navbar/>

<div className="container mt-4">

<h2 className="mb-4">Dashboard Administrativo</h2>

<div className="row">

<div className="col-md-3">
<div className="card text-center shadow">
<div className="card-body">
<h5>Total Alumnos</h5>
<h2 className="text-primary">{stats.alumnos}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card text-center shadow">
<div className="card-body">
<h5>Ingresos del mes</h5>
<h2 className="text-success">${stats.ingresos}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card text-center shadow">
<div className="card-body">
<h5>Pagos pendientes</h5>
<h2 className="text-danger">{stats.pendientes}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card text-center shadow">
<div className="card-body">
<h5>Vencen pronto</h5>
<h2 className="text-warning">{stats.vencimientos}</h2>
</div>
</div>
</div>

</div>

<hr className="my-5"/>

<h4>Alumnos recientes</h4>

<table className="table table-striped">

<thead>

<tr>
<th>Nombre</th>
<th>Email</th>
<th>Estado</th>
<th>Vencimiento</th>
</tr>

</thead>

<tbody>

{alumnos.map((a)=>(
<tr key={a._id}>

<td>{a.nombre}</td>
<td>{a.email}</td>
<td>

{a.estado === "activo" && (
<span className="badge bg-success">Activo</span>
)}

{a.estado === "pendiente" && (
<span className="badge bg-danger">Pendiente</span>
)}

</td>

<td>{a.vencimiento}</td>

</tr>
))}

</tbody>

</table>

</div>

</div>

)

}