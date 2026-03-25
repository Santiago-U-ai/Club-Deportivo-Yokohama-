import {auth} from "../services/firebase"

export default function ProtectedRoute({children}){

const user = auth.currentUser

if(!user){

return <h2>Acceso denegado</h2>

}

return children

}