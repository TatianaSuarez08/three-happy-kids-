import {
  validatePreparation,
  validatePreparationDecision,
  validatePreparationChecklist
} from '../../services/preparacionPedidoService.js';

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
  });

  test('rechaza faltantes sin observación', () => {
    expect(() => validatePreparation(requestedLines, [
      { idProducto: 10, cantidadPreparada: 1 },
      { idProducto: 20, cantidadPreparada: 1 }
    ])).toThrow(expect.objectContaining({ code: 'PREPARATION_INVALID' }));
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
  });

  test('valida el checklist sin pedir cantidades manuales', () => {
    const result = validatePreparationChecklist(requestedLines, [
      { idProducto: 10, encontrado: true, tipoNovedad: '', descripcion: '' },
      { idProducto: 20, encontrado: true, tipoNovedad: '', descripcion: '' }
    ]);

    expect(result.complete).toBe(true);
    expect(result.lines.map((line) => line.preparedQuantity)).toEqual([2, 1]);
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
  });
});
