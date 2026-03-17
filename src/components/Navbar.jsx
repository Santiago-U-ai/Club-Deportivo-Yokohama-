import {Link} from "react-router-dom"

export default function Navbar(){

return(

<nav className="navbar navbar-expand-lg navbar-dark bg-dark">

<div className="container">

<Link className="navbar-brand fw-bold" to="/">
Yokohama Karate
</Link>

<div>

<Link className="btn btn-outline-light" to="/login">
Iniciar sesión
</Link>

</div>

</div>

</nav>

)

}