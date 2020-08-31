import helper, { isRealEmpty } from '../src/core/helper';

class TestShape {
    x: number;
    y: number;
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    move(x:number, y:number) {
        this.x += x;
        this.y += y;
        console.info('Shape moved.');
    }
}

describe('helper:', () => {

    it('isRealEmpty', () => {
        expect(isRealEmpty(0)).toEqual(false);
        expect(isRealEmpty(1)).toEqual(false);
        expect(isRealEmpty(1332)).toEqual(false);
        expect(isRealEmpty('')).toEqual(true);
        expect(isRealEmpty('22')).toEqual(false);
        expect(isRealEmpty({})).toEqual(true);
        expect(isRealEmpty({ a: 1 })).toEqual(false);
        expect(isRealEmpty([])).toEqual(true);
        expect(isRealEmpty([ 1 ])).toEqual(false);
        expect(isRealEmpty([ null ])).toEqual(false);
        expect(isRealEmpty(new Map())).toEqual(true);
        expect(isRealEmpty(new Set())).toEqual(true);

        expect(isRealEmpty({ x: 0, y: 0 })).toEqual(false);
        expect(isRealEmpty(Object.create(null))).toEqual(true);
        const shape = new TestShape();
        expect(isRealEmpty(shape)).toEqual(false);
        const a = Object.create(shape);
        expect(isRealEmpty(a)).toEqual(true);
        expect(isRealEmpty([ 1, 2, 3 ])).toEqual(false);

        // expect(helper.isEmpty(0)).toEqual(false);
    });
});
