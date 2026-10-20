import { Link } from 'react-router-dom';

export default function EvidenciasMensajeria() {
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2 className="admin-titulo">Evidencias de entrega</h2>
            <p className="admin-sub">Cada fotografía se carga desde el detalle de la entrega asignada.</p>
          </div>
        </div>
        <section className="admin-order-card">
          <p>Selecciona una entrega para capturar o elegir una imagen, revisar la vista previa y guardarla de forma persistente.</p>
          <p>La aplicación valida formato y tamaño, y requiere una evidencia guardada antes de permitir marcar el pedido como entregado.</p>
          <Link className="btn-admin-primary" to="/mensajeria/entregas">Ir a mis entregas</Link>
        </section>
      </div>
    </div>
  );
}
