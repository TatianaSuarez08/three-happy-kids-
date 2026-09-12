import { Link, useLocation } from 'react-router-dom';
import '../../styles/bodeguero.css';

const tabs = [
  { label: 'Inicio', to: '/bodeguero' },
  { label: 'Inventario', to: '/bodeguero/inventario' },
  { label: 'Pedidos', to: '/bodeguero/pedidos' },
  { label: 'Movimientos', to: '/bodeguero/movimientos' }
];

export default function BodegueroLayout({ children }) {
  const location = useLocation();

  return (
    <div className="bodeguero-shell">
      <header className="bodeguero-header">
        <div>
          <p className="bodeguero-kicker">Panel del bodeguero</p>
          <h1>Bodega Happy Kids</h1>
        </div>
        <span className="bodeguero-pill">Operaciones diarias</span>
      </header>

      <nav className="bodeguero-tabs" aria-label="Navegación bodeguero">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`bodeguero-tab ${isActive ? 'active' : ''}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <main>{children}</main>
    </div>
  );
}
