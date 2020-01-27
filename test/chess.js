import {expect} from 'chai';
import {Ref} from '../src/chess.js';

describe('Ref()', function() {
    it('should construct', function() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const ref = new Ref(r, c);
                expect(ref.row).to.be.equal(r);
                expect(ref.col).to.be.equal(c);
            }
        }
    });
});
