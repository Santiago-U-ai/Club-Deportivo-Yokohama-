import { useCallback, useEffect, useMemo, useState } from "react";
import { alumnosApi, apiErrorMessage, pagosApi } from "../services/api";
import { currentMonth, toStudent, todayISO } from "../utils/adapters";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await alumnosApi.list();
      setStudents((data ?? []).map(toStudent));
      setError("");
      return data;
    } catch (err) {
      setError(apiErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      // El mensaje ya quedó en `error`.
    });
  }, [refresh]);

  const addStudent = useCallback(
    async (payload) => {
      const result = await alumnosApi.create(payload);
      await refresh();
      return result;
    },
    [refresh],
  );

  const updateStudent = useCallback(
    async (studentId, payload) => {
      const result = await alumnosApi.update(studentId, payload);
      await refresh();
      return result;
    },
    [refresh],
  );

  const removeStudent = useCallback(async (studentId) => {
    await alumnosApi.remove(studentId);
    setStudents((prev) => prev.filter((student) => student.id !== studentId));
  }, []);

  /**
   * Crea o actualiza la mensualidad de un mes concreto.
   * `monto` es opcional: al actualizar sin monto se conserva el actual.
   */
  const saveMensualidad = useCallback(
    async (studentId, { mes, monto, estado }) => {
      const existentes = await pagosApi.list({ alumno_id: studentId, mes });
      const pagoActual = existentes[0];
      const fechaPago = estado === "pagado" ? todayISO() : null;
      const montoNumerico = monto === undefined ? undefined : Number(monto);

      if (pagoActual) {
        await pagosApi.update(pagoActual.id, {
          estado,
          fecha_pago: fechaPago,
          ...(montoNumerico === undefined ? {} : { monto: montoNumerico }),
        });
      } else {
        await pagosApi.create({
          alumno_id: studentId,
          mes,
          monto: montoNumerico ?? 500,
          estado,
          fecha_pago: fechaPago,
        });
      }

      await refresh();
    },
    [refresh],
  );

  /**
   * Marca la mensualidad del mes actual como pagada o pendiente.
   */
  const setMensualidad = useCallback(
    async (studentId, pagado) => {
      await saveMensualidad(studentId, {
        mes: currentMonth(),
        estado: pagado ? "pagado" : "pendiente",
      });
    },
    [saveMensualidad],
  );

  const deletePago = useCallback(
    async (pagoId) => {
      await pagosApi.remove(pagoId);
      await refresh();
    },
    [refresh],
  );

  const stats = useMemo(
    () => ({
      total: students.length,
      alDia: students.filter((student) => student.alDia).length,
      pendientes: students.filter((student) => !student.alDia).length,
    }),
    [students],
  );

  return {
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
  };
}
