import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Login(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const login = async(e)=>{

e.preventDefault()

try{

const res = await axios.post("http://localhost:5000/api/login",{

email,
password

})

localStorage.setItem("token",res.data.token)

navigate("/dashboard")

}catch(err){

alert("Credenciales incorrectas")

}

}

return(

<div className="container mt-5">

<div className="row justify-content-center">

<div className="col-md-4">

<h3 className="text-center mb-4">Ingreso al sistema</h3>

<form onSubmit={login}>

<input
className="form-control mb-3"
type="email"
placeholder="Correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
className="form-control mb-3"
type="password"
placeholder="Contraseña"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button className="btn btn-primary w-100">

Ingresar

</button>

</form>

</div>

</div>

</div>

)

}