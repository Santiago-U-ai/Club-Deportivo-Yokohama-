import {Link} from "react-router-dom"

export default function Sidebar(){

return(

<div className="sidebar">

<h2>Yokohama</h2>

<ul>

<li>
<Link to="/dashboard">Inicio</Link>
</li>

<li>
<Link to="/alumnos">Alumnos</Link>
</li>

<li>
<Link to="/pagos">Pagos</Link>
</li>

<li>
<Link to="/subir">Comprobantes</Link>
</li>

</ul>

</div>

)

}