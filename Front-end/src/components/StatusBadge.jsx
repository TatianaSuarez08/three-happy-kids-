const toneByType = {
  entrada: 'success',
  salida: 'warning',
  ajuste: 'warning'
};

export default function StatusBadge({ tone, type, children }) {
  const badgeTone = tone || toneByType[type] || 'info';
  return <span className={`status-badge is-${badgeTone}`}>{children}</span>;
}
