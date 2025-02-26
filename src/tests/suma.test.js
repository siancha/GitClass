const { sum } = require('../utils/suma');

describe('sum', () => {
    it('Debe devolver la suma de dos números positivos', () => {
        expect(sum(1, 2)).toBe(3);
    });

    it('Debe devolver la suma de dos números negativos', () => {
        expect(sum(-1, -2)).toBe(-3);
    });

    it('Debe devolver la suma de un número positivo y otro negativo', () => {
        expect(sum(1, -2)).toBe(-1);
    });

    it('Debe devolver 0 cuando ambos números son 0', () => {
        expect(sum(0, 0)).toBe(0);
    });

    it('Debe devolver la suma de un número y 0', () => {
        expect(sum(5, 0)).toBe(5);
        expect(sum(0, 5)).toBe(5);
    });
});