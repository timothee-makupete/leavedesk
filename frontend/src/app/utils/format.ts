export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(+date)) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(+date)) return "—";
  return (
    date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) +
    " • " +
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export function daysBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(+s) || isNaN(+e)) return 0;
  return Math.max(1, Math.round((+e - +s) / 86400000) + 1);
}

export function initialsFor(firstName: string, lastName: string) {
  return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() || "?";
}
