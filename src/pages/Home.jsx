export default function Home() {
  return (

    <div className="container mt-5">

      <div className="p-5 mb-4 bg-light rounded-3">

        <div className="container-fluid py-5">

          <h1 className="display-5 fw-bold text-primary">
            Club de Karate Yokohama
          </h1>

          <p className="col-md-8 fs-4">

            Disciplina, respeto y fortaleza.  
            Formamos karatecas con valores.

          </p>

        </div>

      </div>

      <div className="row text-center">

        <div className="col-md-4">

          <h3>Horarios</h3>
          <p>Lunes - Miércoles - Viernes</p>
          <p>4:00 PM</p>

        </div>

        <div className="col-md-4">

          <h3>Instructores</h3>
          <p>Sensei cinturón negro 5° Dan</p>

        </div>

        <div className="col-md-4">

          <h3>Ubicación</h3>
          <p>Popayán - Cauca</p>

        </div>

      </div>

    </div>

  );
}