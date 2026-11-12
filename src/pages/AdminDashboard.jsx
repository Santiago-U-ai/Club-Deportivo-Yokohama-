import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/auth-context";
import { useStudents } from "../hooks/useStudents";
import { apiErrorMessage } from "../services/api";
import {
  currentMonth,
  monthLabel,
  SEDES,
  sedeLabel,
  toAlumnoPayload,
} from "../utils/adapters";

import Sidebar from "../components/Sidebar";
import StatsBar from "../components/StatsBar";
import ActionToolbar from "../components/ActionToolbar";
import StudentTable from "../components/StudentTable";
import AddStudentModal from "../components/AddStudentModal";
import EditStudentModal from "../components/EditStudentModal";
import StudentHistoryModal from "../components/StudentHistoryModal";
import StudentDetailModal from "../components/StudentDetailModal";
import { IconPlus } from "../components/Icons";

// La sede elegida se recuerda entre visitas.
const SEDE_STORAGE_KEY = "yh_sede";

const readStoredSede = () => {
  try {
    const stored = window.localStorage.getItem(SEDE_STORAGE_KEY);
    return SEDES.includes(stored) ? stored : SEDES[0];
  } catch {
    return SEDES[0];
  }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const {
    students,
    loading,
    error,
    refresh,
    addStudent,
    updateStudent,
    removeStudent,
    setMensualidad,
    saveMensualidad,
    deletePago,
  } = useStudents();

  const [activeSede, setActiveSede] = useState(readStoredSede);
  const [activeTab, setActiveTab] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(SEDE_STORAGE_KEY, activeSede);
    } catch {
      // Sin persistencia: la sede vuelve a la primera al recargar.
    }
  }, [activeSede]);

  // Alumnos y grupos de la sede activa.
  const sedeStudents = useMemo(
    () => students.filter((student) => student.sede === activeSede),
    [students, activeSede],
  );

  const sedeCounts = useMemo(
    () =>
      students.reduce(
        (acc, student) => {
          acc[student.sede] = (acc[student.sede] ?? 0) + 1;
          return acc;
        },
        { NORTE: 0, SUR: 0 },
      ),
    [students],
  );

  const counts = useMemo(() => {
    return sedeStudents.reduce((acc, student) => {
      acc[student.group] = (acc[student.group] ?? 0) + 1;
      return acc;
    }, {});
  }, [sedeStudents]);

  const sedeStats = useMemo(
    () => ({
      total: sedeStudents.length,
      alDia: sedeStudents.filter((student) => student.alDia).length,
      pendientes: sedeStudents.filter((student) => !student.alDia).length,
    }),
    [sedeStudents],
  );

  const deudaTotal = useMemo(
    () => sedeStudents.reduce((sum, student) => sum + student.deudaTotal, 0),
    [sedeStudents],
  );

  const groupStudents = useMemo(
    () =>
      activeTab === "TODOS"
        ? sedeStudents
        : sedeStudents.filter((student) => student.group === activeTab),
    [sedeStudents, activeTab],
  );

  const displayStudents = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return groupStudents
      .filter(
        (student) =>
          !term ||
          student.name.toLowerCase().includes(term) ||
          student.correo.toLowerCase().includes(term),
      )
      .filter((student) => {
        if (filterStatus === "Al día") return student.alDia;
        if (filterStatus === "Con deuda") return !student.alDia;
        return true;
      });
  }, [groupStudents, searchQuery, filterStatus]);

  const pageTitle = activeTab === "TODOS" ? "Alumnos" : activeTab;

  const scopeLabel =
    activeTab === "TODOS"
      ? "en la"
      : activeTab === "SIN GRUPO"
        ? "sin grupo en la"
        : `del grupo ${activeTab} en la`;

  const handleAdd = async (form) => {
    setActionError("");
    await addStudent(toAlumnoPayload(form));
  };

  /**
   * Cambia de sede. Si el grupo activo no existe en la sede destino,
   * se vuelve a «Todos» para no dejar el listado vacío.
   */
  const handleSedeChange = (sede) => {
    if (sede === activeSede) return;

    setActiveSede(sede);

    const tabExists =
      activeTab === "TODOS" ||
      students.some(
        (student) => student.sede === sede && student.group === activeTab,
      );

    if (!tabExists) setActiveTab("TODOS");
  };

  const handleEdit = async (studentId, form) => {
    setActionError("");
    await updateStudent(studentId, toAlumnoPayload(form, { partial: true }));
  };

  const handleToggleMensualidad = async (student) => {
    if (
      student.pagadoMesActual &&
      !window.confirm(
        `¿Marcar la mensualidad del mes actual de ${student.name} como pendiente?`,
      )
    ) {
      return;
    }

    setActionError("");
    setBusyId(student.id);

    try {
      await setMensualidad(student.id, !student.pagadoMesActual);
    } catch (toggleError) {
      setActionError(apiErrorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `¿Eliminar a ${student.name}? También se borrarán sus pagos y comprobantes.`,
    );
    if (!confirmed) return;

    setActionError("");
    setBusyId(student.id);

    try {
      await removeStudent(student.id);
    } catch (deleteError) {
      setActionError(apiErrorMessage(deleteError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeSede={activeSede}
        setActiveSede={handleSedeChange}
        sedeCounts={sedeCounts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        total={sedeStats.total}
        userEmail={user?.email}
        onLogout={logout}
      />

      <main className="dashboard-main">
        <header className="page-head">
          <div className="page-head-text">
            <p className="eyebrow">
              Panel administrativo
              <span className="eyebrow-sep" aria-hidden="true" />
              Sede {sedeLabel(activeSede)}
              <span className="eyebrow-sep" aria-hidden="true" />
              {monthLabel(currentMonth())}
            </p>
            <h1>{pageTitle}</h1>
            <p className="page-subtitle">
              {groupStudents.length}{" "}
              {groupStudents.length === 1 ? "alumno" : "alumnos"} {scopeLabel}{" "}
              sede {sedeLabel(activeSede)}
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <IconPlus size={16} />
            Añadir alumno
          </button>
        </header>

        <StatsBar
          stats={sedeStats}
          deudaTotal={deudaTotal}
          sedeLabel={sedeLabel(activeSede)}
        />

        <section className="panel" aria-label="Listado de alumnos">
          <ActionToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filterStatus}
            setFilter={setFilterStatus}
            resultCount={displayStudents.length}
          />

          {actionError && <p className="banner-error">{actionError}</p>}

          {error && (
            <p className="banner-error">
              {error}
              <button type="button" onClick={() => refresh().catch(() => {})}>
                Reintentar
              </button>
            </p>
          )}

          {loading ? (
            <p className="empty-state">Cargando alumnos…</p>
          ) : (
            <StudentTable
              students={displayStudents}
              onDelete={handleDelete}
              onEdit={setEditingStudent}
              onHistory={setHistoryStudent}
              onView={setViewingStudent}
              onToggleMensualidad={handleToggleMensualidad}
              busyId={busyId}
            />
          )}
        </section>
      </main>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        activeTab={activeTab}
        activeSede={activeSede}
      />

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleEdit}
        />
      )}

      {historyStudent && (
        <StudentHistoryModal
          student={historyStudent}
          onClose={() => setHistoryStudent(null)}
          onSave={saveMensualidad}
          onDeletePago={deletePago}
        />
      )}

      {viewingStudent && (
        <StudentDetailModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={(student) => {
            setViewingStudent(null);
            setEditingStudent(student);
          }}
          onHistory={(student) => {
            setViewingStudent(null);
            setHistoryStudent(student);
          }}
        />
      )}
    </div>
  );
}
