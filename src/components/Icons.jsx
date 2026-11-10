/**
 * Iconos de trazo usados en el panel. Todos heredan el color del texto
 * (`currentColor`) para poder reutilizarlos en cualquier contexto.
 */
function Icon({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Icon>
  );
}

export function IconPlus(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconEdit(props) {
  return (
    <Icon {...props}>
      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 6.5l3 3" />
    </Icon>
  );
}

export function IconHistory(props) {
  return (
    <Icon {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5v4h4" />
      <path d="M12 8v4.3l2.8 1.7" />
    </Icon>
  );
}

export function IconCheck(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 12.5l5 5 10-11" />
    </Icon>
  );
}

export function IconUndo(props) {
  return (
    <Icon {...props}>
      <path d="M4 4v5h5" />
      <path d="M5.6 16.5A7.5 7.5 0 1 0 6.2 7.4L4 9" />
    </Icon>
  );
}

export function IconTrash(props) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.8h5V7" />
      <path d="M6 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h7a1.6 1.6 0 0 0 1.6-1.5L18 7" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function IconLogOut(props) {
  return (
    <Icon {...props}>
      <path d="M14 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H14" />
      <path d="M17 8.5l3.5 3.5-3.5 3.5" />
      <path d="M9.5 12H20" />
    </Icon>
  );
}

export function IconUsers(props) {
  return (
    <Icon {...props}>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4" />
      <path d="M15.5 4.3a3.5 3.5 0 0 1 0 6.4" />
    </Icon>
  );
}

export function IconWallet(props) {
  return (
    <Icon {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5z" />
      <path d="M4 9h13.5" />
      <circle cx="16.5" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconClose(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function IconAlert(props) {
  return (
    <Icon {...props}>
      <path d="M12 4.5 21 19.5H3L12 4.5z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </Icon>
  );
}

export function IconCalendar(props) {
  return (
    <Icon {...props}>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </Icon>
  );
}
