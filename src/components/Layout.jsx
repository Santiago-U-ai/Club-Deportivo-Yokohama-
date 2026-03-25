import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

export default function Layout({children}){

return(

<div>

<Navbar/>

<div className="container-fluid">

<div className="row">

<div className="col-md-2 p-0">
<Sidebar/>
</div>

<div className="col-md-10 p-4">

{children}

</div>

</div>

</div>

</div>

)

}