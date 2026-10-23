
export default function BodegueroLayout({ children }) {
  return (
    <div className="bodeguero-shell">
      <header className="bodeguero-header">
        <div>
          <p className="bodeguero-kicker">Panel del bodeguero</p>
          <h1>Bodega Happy Kids</h1>
        </div>
        <span className="bodeguero-pill">Operaciones diarias</span>
      </header>

      <main>{children}</main>
    </div>
  );
}
