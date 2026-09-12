export default function EmptyState({ children, className = '' }) {
  return <div className={`app-empty-state ${className}`.trim()}>{children}</div>;
}
