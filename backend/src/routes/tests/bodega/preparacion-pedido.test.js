import {
  validatePreparation,
  validatePreparationDecision,
  validatePreparationChecklist,
  getWarehouseOrderState
} from '../../../services/preparacionPedidoService.js';

const requestedLines = [
  { idProducto: 10, cantidad: 2, nombre: 'Camiseta' },
  { idProducto: 20, cantidad: 1, nombre: 'Pantalón' }
];

describe('validación de alistamiento de pedidos', () => {
  test('acepta un alistamiento completo con cantidades exactas', () => {
    const result = validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 2 },
      { idProducto: 20, cantidadPreparada: 1 }
    ]);

    expect(result.complete).toBe(true);
    expect(result.missingLines).toEqual([]);
  });

  test('registra faltantes explicados y conserva el pedido incompleto', () => {
    const result = validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1, observaciones: 'Falta una unidad' },
      { idProducto: 20, cantidadPreparada: 1 }
    ]);

    expect(result.complete).toBe(false);
    expect(result.missingLines).toHaveLength(1);
    expect(result.missingLines[0].productId).toBe(10);
    expect(validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1, observaciones: 'Falta una unidad' },
      { idProducto: 20, cantidadPreparada: 1 }
    ], null).observation).toBe('');
  });

  test('rechaza faltantes sin observación', () => {
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1 },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
  });

  test('rechaza entradas de alistamiento que no son listas', () => {
    expect(() => validatePreparation(null, [])).toThrow(
      expect.objectContaining({ code: 'PREPARATION_INVALID' })
    );
    expect(() => validatePreparation(requestedLines, null)).toThrow(
      expect.objectContaining({ code: 'PREPARATION_INVALID' })
    );
  });

  test('acepta identificadores de producto representados como texto', () => {
    const result = validatePreparation(
      [{ idProducto: '10', cantidad: 2, nombre: 'Camiseta' }],
      [{ idProducto: '10', cantidadPreparada: 2 }]
    );

    expect(result.complete).toBe(true);
    expect(result.lines[0].productId).toBe(10);
  });

  test('rechaza cantidades y observaciones con tipos o límites inválidos', () => {
    const validLine = { idProducto: 10, cantidadPreparada: 2 };
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: null },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [
      { ...validLine, observaciones: 'x'.repeat(256) },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1 },
      { idProducto: 20, cantidadPreparada: 1 }
    ], 'x'.repeat(2001))).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    const result = validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1, observaciones: 'Falta una unidad' },
      { idProducto: 20, cantidadPreparada: 1 }
    ], '  Novedad general  ');
    expect(result.observation).toBe('Novedad general');
  });

  test('rechaza productos duplicados, omitidos o ajenos al pedido', () => {
    const completeLine = { idProducto: 10, cantidadPreparada: 2 };

    expect(() => validatePreparation(requestedLines, [completeLine, completeLine]))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [completeLine]))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [
      completeLine,
      { idProducto: 99, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
  });

  test('rechaza cantidades inválidas y pedidos sin productos', () => {
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 3 },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: '' },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: true },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparation([], [{ idProducto: 10, cantidadPreparada: 1 }]))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
  });

  test('confirma que el pedido está listo sin solicitar cantidades al bodeguero', () => {
    const result = validatePreparationDecision(requestedLines, true);

    expect(result.complete).toBe(true);
    expect(result.lines.map(({ preparedQuantity, requestedQuantity }) => (
      preparedQuantity === requestedQuantity
    ))).toEqual([true, true]);
    expect(result.missingLines).toEqual([]);
  });

  test('registra una novedad general sin inventar cantidades preparadas', () => {
    const result = validatePreparationDecision(
      requestedLines,
      false,
      'Falta una prenda y se informa a Administración'
    );

    expect(result.complete).toBe(false);
    expect(result.lines).toEqual([]);
    expect(result.observation).toBe('Falta una prenda y se informa a Administración');
    expect(result.missingLines.map((line) => line.preparedQuantity)).toEqual([null, null]);
  });

  test('exige novedad cuando Bodega reporta que falta algo', () => {
    expect(() => validatePreparationDecision(requestedLines, false, '  '))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationDecision(null, true))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationDecision(requestedLines, 'sí'))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationDecision(requestedLines, false, 'x'.repeat(2001)))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(validatePreparationDecision(requestedLines, true, null).observation).toBe('');
  });

  test('valida el checklist sin pedir cantidades manuales', () => {
    const result = validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: true, tipoNovedad: '', descripcion: '' },
      { idProducto: 20, encontrado: true, tipoNovedad: '', descripcion: '' }
    ]);

    expect(result.complete).toBe(true);
    expect(result.lines.map((line) => line.preparedQuantity)).toEqual([2, 1]);

    const incomplete = validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: false, tipoNovedad: 'Dañado', descripcion: 'Empaque roto' },
      { idProducto: 20, encontrado: true, tipoNovedad: '', descripcion: '' }
    ]);
    expect(incomplete.complete).toBe(false);
    expect(incomplete.missingLines[0]).toMatchObject({
      productId: 10,
      preparedQuantity: 0,
      issueType: 'Dañado'
    });
  });

  test('requiere tipo y descripción para cada producto no encontrado', () => {
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: false, tipoNovedad: 'No encontrado', descripcion: '' },
      { idProducto: 20, encontrado: true, tipoNovedad: '', descripcion: '' }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: false, tipoNovedad: '', descripcion: 'No está en el estante' },
      { idProducto: 20, encontrado: true, tipoNovedad: '', descripcion: '' }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
  });

  test('rechaza checklists que omiten, duplican o reportan productos ajenos', () => {
    const foundLine = { idProducto: 10, encontrado: true, tipoNovedad: '', descripcion: '' };

    expect(() => validatePreparationChecklist(requestedLines, [foundLine]))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [foundLine, foundLine]))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      foundLine,
      { idProducto: 99, encontrado: true, tipoNovedad: '', descripcion: '' }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(null, []))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, null))
      .toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: 'sí' },
      { idProducto: 20, encontrado: true }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: false, tipoNovedad: 'No encontrado', descripcion: 'x'.repeat(1001) },
      { idProducto: 20, encontrado: true }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: true, tipoNovedad: 'Dañado', descripcion: '' },
      { idProducto: 20, encontrado: true }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
    expect(() => validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: false, tipoNovedad: 'Otro', descripcion: 'No aparece' },
      { idProducto: 20, encontrado: true }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
  });

  test.each([
    [{ deliveryStatus: 'Por recoger' }, 'Listo para envío'],
    [{ deliveryStatus: 'Por recoger', assigned: true }, 'Asignado a Mensajería'],
    [{ deliveryStatus: 'En camino' }, 'En camino'],
    [{ deliveryStatus: 'Entregado' }, 'Entregado'],
    [{ deliveryStatus: 'Cancelado' }, 'Cancelado'],
    [{ deliveryStatus: 'Otro', latestOperation: 'PreparacionIniciada' }, 'En preparación'],
    [{ deliveryStatus: 'Otro', latestOperation: 'AlistamientoIncompleto' }, 'Incidencia'],
    [{ deliveryStatus: 'Otro', latestOperation: 'Otra operación' }, 'Pendiente de preparación']
  ])('determina el estado de bodega para %j', (input, expected) => {
    expect(getWarehouseOrderState(input)).toBe(expected);
  });
});
