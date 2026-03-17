import {Link} from "react-router-dom"

export default function Hero(){

return(

<section className="hero">

<div className="container text-center">

<h1 className="display-3 fw-bold">

Disciplina • Respeto • Fortaleza

</h1>

<p className="lead">

Club Deportivo de Karate Yokohama

</p>

<Link to="/login" className="btn btn-primary btn-lg">

Ingresar al sistema

</Link>

</div>

</section>

)

}