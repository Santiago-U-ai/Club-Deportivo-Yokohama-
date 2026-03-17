import {useEffect,useState} from "react"
import API from "../services/api"

export default function Pagos(){

const [pagos,setPagos] = useState([])

useEffect(()=>{

API.get("/pagos")

.then(res=>setPagos(res.data))

},[])

return(

<div className="content">

<h2>Pagos</h2>

<table className="table">

<thead>

<tr>

<th>Alumno</th>
<th>Mes</th>
<th>Estado</th>

</tr>

</thead>

<tbody>

{pagos.map(p=>(

<tr key={p._id}>

<td>{p.alumno}</td>
<td>{p.mes}</td>
<td>{p.estado}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}