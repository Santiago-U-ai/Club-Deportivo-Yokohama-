import {useState} from "react"
import API from "../services/api"

export default function SubirComprobante(){

const [file,setFile] = useState()

const subir = async ()=>{

const formData = new FormData()

formData.append("comprobante",file)

await API.post("/pagos/comprobante",formData)

alert("Comprobante subido")

}

return(

<div className="content">

<h2>Subir comprobante</h2>

<input
type="file"
onChange={e=>setFile(e.target.files[0])}
/>

<button
className="btn btn-primary"
onClick={subir}
>

Subir

</button>

</div>

)

}