export const validatePreparation = (requestedLines, submittedLines, generalObservation = '') => {
  if (!Array.isArray(requestedLines) || requestedLines.length === 0 || !Array.isArray(submittedLines)) {
    const error = new Error('El pedido no contiene productos para alistar');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  const submittedByProduct = new Map();
  submittedLines.forEach((line) => {
    const rawProductId = line?.idProducto;
    const rawPreparedQuantity = line?.cantidadPreparada;
    const validProductIdType = typeof rawProductId === 'number' || typeof rawProductId === 'string';
    const validQuantityType = typeof rawPreparedQuantity === 'number' || typeof rawPreparedQuantity === 'string';
    const productId = Number(line?.idProducto);
    const preparedQuantity = Number(line?.cantidadPreparada);
    const observation = typeof line?.observaciones === 'string' ? line.observaciones.trim() : '';
    if (!validProductIdType || !Number.isInteger(productId) || productId <= 0 || submittedByProduct.has(productId)) {
      const error = new Error('La lista de productos contiene identificadores inválidos o duplicados');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    if (!validQuantityType || (typeof rawPreparedQuantity === 'string' && !rawPreparedQuantity.trim())
      || !Number.isInteger(preparedQuantity) || preparedQuantity < 0 || observation.length > 255) {
      const error = new Error('Las cantidades y observaciones del alistamiento no son válidas');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    submittedByProduct.set(productId, { preparedQuantity, observation });
  });

  if (submittedByProduct.size !== requestedLines.length) {
    const error = new Error('Debes registrar una cantidad preparada para cada producto del pedido');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  const normalizedLines = requestedLines.map((requestedLine) => {
    const productId = Number(requestedLine.idProducto);
    const requestedQuantity = Number(requestedLine.cantidad);
    const submitted = submittedByProduct.get(productId);
    if (!submitted || !Number.isInteger(requestedQuantity) || requestedQuantity <= 0
      || submitted.preparedQuantity > requestedQuantity) {
      const error = new Error('Las cantidades preparadas deben estar entre cero y la cantidad solicitada');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }

    return {
      productId,
      requestedQuantity,
      preparedQuantity: submitted.preparedQuantity,
      observation: submitted.observation,
      productName: requestedLine.nombre
    };
  });

  const missingLines = normalizedLines.filter(
    (line) => line.preparedQuantity < line.requestedQuantity
  );
  const overallObservation = typeof generalObservation === 'string' ? generalObservation.trim() : '';
  if (overallObservation.length > 2000) {
    const error = new Error('Las observaciones generales no pueden superar 2000 caracteres');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }
  if (missingLines.some((line) => !line.observation) && !overallObservation) {
    const error = new Error('Registra una observación para cada faltante o una observación general');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  return {
    complete: missingLines.length === 0,
    lines: normalizedLines,
    missingLines,
    observation: overallObservation
  };
};

export const validatePreparationDecision = (requestedLines, ready, observation = '') => {
  if (!Array.isArray(requestedLines) || requestedLines.length === 0) {
    const error = new Error('El pedido no contiene productos para alistar');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }
  if (typeof ready !== 'boolean') {
    const error = new Error('Debes indicar si el pedido está listo o si presenta faltantes');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  const normalizedObservation = typeof observation === 'string' ? observation.trim() : '';
  if (normalizedObservation.length > 2000 || (!ready && !normalizedObservation)) {
    const error = new Error(
      normalizedObservation.length > 2000
        ? 'La novedad no puede superar 2000 caracteres'
        : 'Describe el faltante o la novedad antes de reportarlo'
    );
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  return {
    complete: ready,
    lines: ready
      ? requestedLines.map((line) => ({
        productId: Number(line.idProducto),
        requestedQuantity: Number(line.cantidad),
        preparedQuantity: Number(line.cantidad),
        observation: '',
        productName: line.nombre
      }))
      : [],
    missingLines: ready ? [] : requestedLines.map((line) => ({
      productId: Number(line.idProducto),
      requestedQuantity: Number(line.cantidad),
      preparedQuantity: null,
      observation: normalizedObservation,
      productName: line.nombre
    })),
    observation: normalizedObservation
  };
};

export const validatePreparationChecklist = (requestedLines, submittedLines) => {
  if (!Array.isArray(requestedLines) || requestedLines.length === 0 || !Array.isArray(submittedLines)) {
    const error = new Error('El pedido no contiene productos para alistar');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  const submittedByProduct = new Map();
  for (const line of submittedLines) {
    const productId = Number(line?.idProducto);
    const description = typeof line?.descripcion === 'string' ? line.descripcion.trim() : '';
    if (!Number.isInteger(productId) || productId <= 0 || submittedByProduct.has(productId)
      || typeof line?.encontrado !== 'boolean') {
      const error = new Error('La lista de verificación contiene productos inválidos o duplicados');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    if (!line.encontrado && (!description || description.length > 1000)) {
      const error = new Error('Cada producto no encontrado requiere tipo y descripción de novedad');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    if (line.encontrado && (line.tipoNovedad || description)) {
      const error = new Error('No registres novedades para productos marcados como encontrados');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    submittedByProduct.set(productId, {
      found: line.encontrado,
      issueType: line.tipoNovedad,
      description
    });
  }

  if (submittedByProduct.size !== requestedLines.length) {
    const error = new Error('Debes verificar todos los productos del pedido');
    error.code = 'PREPARATION_INVALID';
    throw error;
  }

  const lines = requestedLines.map((requestedLine) => {
    const productId = Number(requestedLine.idProducto);
    const submitted = submittedByProduct.get(productId);
    if (!submitted) {
      const error = new Error('La lista de verificación no coincide con los productos del pedido');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    if (!submitted.found && !['No encontrado', 'Dañado', 'Referencia incorrecta', 'Talla incorrecta', 'Color incorrecto', 'Otra novedad'].includes(submitted.issueType)) {
      const error = new Error('Selecciona un tipo de novedad válido para cada producto no encontrado');
      error.code = 'PREPARATION_INVALID';
      throw error;
    }
    return {
      productId,
      requestedQuantity: Number(requestedLine.cantidad),
      preparedQuantity: submitted.found ? Number(requestedLine.cantidad) : 0,
      observation: submitted.description,
      productName: requestedLine.nombre,
      found: submitted.found,
      issueType: submitted.issueType
    };
  });

  const missingLines = lines.filter((line) => !line.found);
  return {
    complete: missingLines.length === 0,
    lines,
    missingLines,
    observation: ''
  };
};

export const getWarehouseOrderState = ({ deliveryStatus, latestOperation, assigned = false }) => {
  if (deliveryStatus === 'Por recoger') return assigned ? 'Asignado a Mensajería' : 'Listo para envío';
  if (deliveryStatus === 'En camino') return 'En camino';
  if (deliveryStatus === 'Entregado') return 'Entregado';
  if (deliveryStatus === 'Cancelado') return 'Cancelado';
  if (latestOperation === 'PreparacionIniciada') return 'En preparación';
  if (latestOperation === 'AlistamientoIncompleto') return 'Incidencia';
  return 'Pendiente de preparación';
};
