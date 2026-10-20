import { validateCourierTransition } from '../../services/pedidoWorkflowService.js';

describe('transiciones de entrega', () => {
  test('permite iniciar recorrido y reintentar una entrega fallida', () => {
    expect(() => validateCourierTransition({
      currentStatus: 'Asignado',
      nextStatus: 'En camino',
      hasEvidence: false
    })).not.toThrow();
    expect(() => validateCourierTransition({
      currentStatus: 'Entrega fallida',
      nextStatus: 'En camino',
      hasEvidence: false
    })).not.toThrow();
  });

  test('requiere evidencia para completar la entrega', () => {
    expect(() => validateCourierTransition({
      currentStatus: 'En camino',
      nextStatus: 'Entregado',
      hasEvidence: false
    })).toThrow(expect.objectContaining({ code: 'EVIDENCE_REQUIRED' }));
    expect(() => validateCourierTransition({
      currentStatus: 'En camino',
      nextStatus: 'Entregado',
      hasEvidence: true
    })).not.toThrow();
  });

  test('registra el motivo de entrega fallida y rechaza transiciones inválidas', () => {
    expect(() => validateCourierTransition({
      currentStatus: 'En camino',
      nextStatus: 'Entrega fallida',
      hasEvidence: false,
      observation: 'Cliente ausente'
    })).not.toThrow();
    expect(() => validateCourierTransition({
      currentStatus: 'En camino',
      nextStatus: 'Entrega fallida',
      hasEvidence: false
    })).toThrow(expect.objectContaining({ code: 'INVALID_OBSERVATION' }));
    expect(() => validateCourierTransition({
      currentStatus: 'Entregado',
      nextStatus: 'En camino',
      hasEvidence: true
    })).toThrow(expect.objectContaining({ code: 'INVALID_TRANSITION' }));
  });
});
