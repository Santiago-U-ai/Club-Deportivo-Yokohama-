import { useMemo, useState } from "react";
import { useAuth } from "../context/auth-context";
import { useStudents } from "../hooks/useStudents";
import { apiErrorMessage } from "../services/api";
import {
  currentMonth,
  monthLabel,
  toAlumnoPayload,
} from "../utils/adapters";

import Sidebar from "../components/Sidebar";
import StatsBar from "../components/StatsBar";
import ActionToolbar from "../components/ActionToolbar";
import StudentTable from "../components/StudentTable";
import AddStudentModal from "../components/AddStudentModal";
import EditStudentModal from "../components/EditStudentModal";
import StudentHistoryModal from "../components/StudentHistoryModal";
import { IconPlus } from "../components/Icons";

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
    stats,
  } = useStudents();

  const [activeTab, setActiveTab] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const counts = useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.group] = (acc[student.group] ?? 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const deudaTotal = useMemo(
    () => students.reduce((sum, student) => sum + student.deudaTotal, 0),
    [students],
  );

  const groupStudents = useMemo(
    () =>
      activeTab === "TODOS"
        ? students
        : students.filter((student) => student.group === activeTab),
    [students, activeTab],
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
      ? "en el club"
      : activeTab === "SIN GRUPO"
        ? "sin grupo asignado"
        : `en el grupo ${activeTab}`;

  const handleAdd = async (form) => {
    setActionError("");
    await addStudent(toAlumnoPayload(form));
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        total={stats.total}
        userEmail={user?.email}
        onLogout={logout}
      />

      <main className="dashboard-main">
        <header className="page-head">
          <div className="page-head-text">
            <p className="eyebrow">
              Panel administrativo
              <span className="eyebrow-sep" aria-hidden="true" />
              {monthLabel(currentMonth())}
            </p>
            <h1>{pageTitle}</h1>
            <p className="page-subtitle">
              {groupStudents.length}{" "}
              {groupStudents.length === 1 ? "alumno" : "alumnos"} {scopeLabel}
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

        <StatsBar stats={stats} deudaTotal={deudaTotal} />

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
    </div>
  );
}
