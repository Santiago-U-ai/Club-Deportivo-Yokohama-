export const BELTS = [
  { id: "BLANCO", label: "BLANCO", color: "#FFFFFF" },
  { id: "AMARILLO", label: "AMARILLO", color: "#FFD700" },
  { id: "NARANJA", label: "NARANJA", color: "#FF7A00" },
  { id: "AZUL", label: "AZUL", color: "#007AFF" },
  { id: "VERDE", label: "VERDE", color: "#00FF47" },
  { id: "VIOLETA", label: "VIOLETA", color: "#8A2BE2" },
  { id: "MARRON", label: "MARRÓN", color: "#8B4513" },
  { id: "NEGRO", label: "NEGRO", color: "#A1A1AA" },
];

export const GROUPS = ["BABY", "JUVENIL", "SENIOR"];

export const beltColorFor = (belt) =>
  BELTS.find((item) => item.id === belt)?.color ?? "#848795";

export const initialsFor = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

// Fechas locales: `toISOString` usa UTC y adelantaría el día/mes en zonas
// como America/Bogota durante la noche.
export const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * "2026-11" -> "Nov 2026"
 */
export const monthLabel = (mes) => {
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) return "—";

  const [year, month] = mes.split("-");
  const name = MONTHS[Number(month) - 1];

  return name ? `${name} ${year}` : mes;
};

/**
 * Edad en años cumplidos a partir de una fecha AAAA-MM-DD.
 */
export const ageFromBirthDate = (value) => {
  if (!value) return null;

  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

/**
 * Tiempo transcurrido desde una fecha AAAA-MM-DD: "2 años 3 meses",
 * "7 meses" o "menos de 1 mes".
 */
export const elapsedLabel = (value) => {
  if (!value) return "";

  const start = new Date(`${value}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";

  const today = new Date();
  if (start > today) return "";

  let months =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth());

  if (today.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const rest = months % 12;

  if (months === 0) return "menos de 1 mes";
  if (years === 0) return `${rest} ${rest === 1 ? "mes" : "meses"}`;
  if (rest === 0) return `${years} ${years === 1 ? "año" : "años"}`;

  return `${years} ${years === 1 ? "año" : "años"} ${rest} ${
    rest === 1 ? "mes" : "meses"
  }`;
};

/**
 * Convierte un alumno de la API al modelo que usa la interfaz.
 * `alDia` indica si la mensualidad del mes actual está pagada.
 */
export const toStudent = (alumno) => {
  return {
    id: alumno.id,
    name: alumno.nombre ?? "Sin nombre",
    correo: alumno.correo ?? "",
    phone: alumno.telefono ?? "",
    birthDate: alumno.fecha_nacimiento ?? "",
    startDate: alumno.fecha_inicio ?? "",
    age: ageFromBirthDate(alumno.fecha_nacimiento),
    karateTime: elapsedLabel(alumno.fecha_inicio),
    direccion: alumno.direccion ?? "",
    belt: alumno.cinturon ?? "BLANCO",
    beltColor: beltColorFor(alumno.cinturon),
    group: alumno.grupo ?? "SIN GRUPO",
    initials: initialsFor(alumno.nombre),
    lastPaymentDate: alumno.ultimo_pago ?? null,
    alDia: alumno.al_dia === true,
    pagadoMesActual: alumno.pagado_mes_actual === true,
    activo: alumno.activo !== false,
    pagosPendientes: alumno.pagos_pendientes ?? 0,
    mesDeuda: alumno.mes_deuda ?? null,
    mesesPendientes: Array.isArray(alumno.meses_pendientes)
      ? alumno.meses_pendientes
      : [],
    deudaTotal: Number(alumno.deuda_total ?? 0),
  };
};

/**
 * Convierte el formulario del modal al payload de la API.
 * En modo `partial` (edición), los campos vacíos se envían como null para
 * poder borrarlos.
 */
export const toAlumnoPayload = (form, { partial = false } = {}) => ({
  nombre: form.name?.trim(),
  correo: form.correo?.trim() || (partial ? null : undefined),
  telefono: form.phone?.trim() || (partial ? null : undefined),
  fecha_nacimiento: form.birthDate || (partial ? null : undefined),
  fecha_inicio: form.startDate || (partial ? null : undefined),
  direccion: form.direccion?.trim() || (partial ? null : undefined),
  cinturon: form.belt || undefined,
  grupo: form.group || (partial ? null : undefined),
  activo: form.isActive !== false,
});

/**
 * Fecha legible para la tabla ("04 Nov 2026" o "Sin pagos").
 */
export const formatDate = (value) => {
  if (!value) return "Sin pagos";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin pagos";

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
