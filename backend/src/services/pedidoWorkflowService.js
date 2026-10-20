const workflowError = (code, message) => Object.assign(new Error(message), { code });

export const validateCourierTransition = ({
  currentStatus,
  nextStatus,
  hasEvidence,
  observation = ''
}) => {
  const allowed = nextStatus === 'En camino'
    ? ['Asignado', 'Entrega fallida'].includes(currentStatus)
    : nextStatus === 'Entrega fallida'
      ? currentStatus === 'En camino'
      : nextStatus === 'Entregado'
        ? currentStatus === 'En camino' && hasEvidence
        : false;

  if (!allowed) {
    if (nextStatus === 'Entregado' && !hasEvidence) {
      throw workflowError('EVIDENCE_REQUIRED', 'Guarda la fotografía de evidencia antes de marcar la entrega');
    }
    throw workflowError('INVALID_TRANSITION', 'La transición de estado no está permitida');
  }
  if (nextStatus === 'Entrega fallida' && !observation.trim()) {
    throw workflowError('INVALID_OBSERVATION', 'Describe el motivo de la entrega fallida');
  }
};
