import React from 'react';
import { Link } from 'react-router-dom';

// Página simple para mostrar cuando el usuario no tiene permisos
export default function NoAutorizado() {
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
      <div style={{textAlign: 'center'}}>
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <div style={{marginTop: '16px'}}>
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
