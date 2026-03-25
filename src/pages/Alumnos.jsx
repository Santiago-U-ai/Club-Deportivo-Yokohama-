import {useEffect,useState} from "react"
import API from "../services/api"

export default function Alumnos(){

const [alumnos,setAlumnos] = useState([]) 

useEffect(()=>{

API.get("/alumnos")

.then(res=>setAlumnos(res.data))

},[])

return(

<div className="content">

<h2>Alumnos</h2>

<table className="table">

<thead>

<tr>
<th>Nombre</th>
<th>Correo</th>
<th>Teléfono</th>
</tr>

</thead>

<tbody>

{alumnos.map(a=>(

<tr key={a._id}>

<td>{a.nombre}</td>
<td>{a.correo}</td>
<td>{a.telefono}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}