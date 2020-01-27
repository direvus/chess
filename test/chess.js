import {expect} from 'chai';
import {Ref} from '../src/chess.js';

describe('Ref', function() {
    describe('.constructor', function() {
        it("should set row and col", function() {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    expect(ref.row).to.be.equal(r);
                    expect(ref.col).to.be.equal(c);
                }
            }
        });
    });
    describe('#rank', function() {
        it("should return 8 minus the row index", function() {
            const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
            for (let r = 0; r < 8; r++) {
                const ref = new Ref(r, 0);
                expect(ref.rank).to.be.equal(ranks[r]);
            }
        });
    });
    describe('#file', function() {
        it("should return 'a', 'b', ... ", function() {
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            for (let c = 0; c < 8; c++) {
                const ref = new Ref(0, c);
                expect(ref.file).to.be.equal(files[c]);
            }
        });
    });
    describe('#label', function() {
        it("should return 'a8' ... 'h1'", function() {
            const squares = [
                ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'],
                ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
                ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'],
                ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'],
                ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
                ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'],
                ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
                ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    expect(ref.label).to.be.equal(squares[r][c]);
                }
            }
        });
    });
    describe('#colour', function() {
        it("should return alternating true/false, with a8 == true", function() {
            const w = true;
            const b = false;
            const squares = [
                [w, b, w, b, w, b, w, b],
                [b, w, b, w, b, w, b, w],
                [w, b, w, b, w, b, w, b],
                [b, w, b, w, b, w, b, w],
                [w, b, w, b, w, b, w, b],
                [b, w, b, w, b, w, b, w],
                [w, b, w, b, w, b, w, b],
                [b, w, b, w, b, w, b, w]];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    expect(ref.colour).to.be.equal(squares[r][c]);
                }
            }
        });
    });
    describe('#equals', function() {
        it("should return whether Refs are equal", function() {
            const t = true;
            const f = false;
            const a = new Ref(7, 7);
            const squares = [
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, f],
                [f, f, f, f, f, f, f, t]];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const b = new Ref(r, c);
                    expect(a.equals(b)).to.be.equal(squares[r][c]);
                }
            }
        });
    });
    describe('#cmp', function() {
        it("should return -1, 0, 1 for less, equal, greater", function() {
            const b = new Ref(4, 4);
            const squares = [
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [-1, -1, -1, -1, -1, -1, -1, -1],
                [-1, -1, -1, -1,  0,  1,  1,  1],
                [ 1,  1,  1,  1,  1,  1,  1,  1],
                [ 1,  1,  1,  1,  1,  1,  1,  1],
                [ 1,  1,  1,  1,  1,  1,  1,  1]];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const a = new Ref(r, c);
                    expect(a.cmp(b)).to.be.equal(squares[r][c]);
                }
            }
        });
    });
    describe('#diff', function() {
        it("should return difference as [rows, cols]", function() {
            const b = new Ref(4, 4);
            const squares = [
                [[-4, -4], [-4, -3], [-4, -2], [-4, -1], [-4,  0], [-4,  1], [-4,  2], [-4,  3]],
                [[-3, -4], [-3, -3], [-3, -2], [-3, -1], [-3,  0], [-3,  1], [-3,  2], [-3,  3]],
                [[-2, -4], [-2, -3], [-2, -2], [-2, -1], [-2,  0], [-2,  1], [-2,  2], [-2,  3]],
                [[-1, -4], [-1, -3], [-1, -2], [-1, -1], [-1,  0], [-1,  1], [-1,  2], [-1,  3]],
                [[ 0, -4], [ 0, -3], [ 0, -2], [ 0, -1], [ 0,  0], [ 0,  1], [ 0,  2], [ 0,  3]],
                [[ 1, -4], [ 1, -3], [ 1, -2], [ 1, -1], [ 1,  0], [ 1,  1], [ 1,  2], [ 1,  3]],
                [[ 2, -4], [ 2, -3], [ 2, -2], [ 2, -1], [ 2,  0], [ 2,  1], [ 2,  2], [ 2,  3]],
                [[ 3, -4], [ 3, -3], [ 3, -2], [ 3, -1], [ 3,  0], [ 3,  1], [ 3,  2], [ 3,  3]]];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const a = new Ref(r, c);
                    expect(a.diff(b)).to.deep.equal(squares[r][c]);
                }
            }
        });
    });
    describe('#add', function() {
        it("should add [rows, cols]", function() {
            const a = new Ref(4, 4);
            const squares = [
                [[-4, -4], [-4, -3], [-4, -2], [-4, -1], [-4,  0], [-4,  1], [-4,  2], [-4,  3]],
                [[-3, -4], [-3, -3], [-3, -2], [-3, -1], [-3,  0], [-3,  1], [-3,  2], [-3,  3]],
                [[-2, -4], [-2, -3], [-2, -2], [-2, -1], [-2,  0], [-2,  1], [-2,  2], [-2,  3]],
                [[-1, -4], [-1, -3], [-1, -2], [-1, -1], [-1,  0], [-1,  1], [-1,  2], [-1,  3]],
                [[ 0, -4], [ 0, -3], [ 0, -2], [ 0, -1], [ 0,  0], [ 0,  1], [ 0,  2], [ 0,  3]],
                [[ 1, -4], [ 1, -3], [ 1, -2], [ 1, -1], [ 1,  0], [ 1,  1], [ 1,  2], [ 1,  3]],
                [[ 2, -4], [ 2, -3], [ 2, -2], [ 2, -1], [ 2,  0], [ 2,  1], [ 2,  2], [ 2,  3]],
                [[ 3, -4], [ 3, -3], [ 3, -2], [ 3, -1], [ 3,  0], [ 3,  1], [ 3,  2], [ 3,  3]]];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const square = squares[r][c];
                    const b = a.add(square[0], square[1]);
                    const result = new Ref(r, c);
                    expect(b.equals(result)).to.be.true;
                }
            }
        });
    });
    describe('#getCell', function() {
        it("should get board cell contents", function() {
            const board = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    expect(ref.getCell(board)).to.equal(board[r][c]);
                }
            }
        });
        it("should return null for out-of-bounds refs", function() {
            const board = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            const ref = new Ref(9, 0);
            expect(ref.getCell(board)).to.be.null;
        });
    });
    describe('#isEmpty', function() {
        it("should return whether board cells are empty", function() {
            const board = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            const ref = new Ref(4, 4);
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    const empty = ref.isEmpty(board);
                    if (r > 1 && r < 6) {
                        expect(empty).to.be.true;
                    } else {
                        expect(empty).to.be.false;
                    }
                }
            }
        });
    });
    describe('#setCell', function() {
        it("should set board cell contents", function() {
            const board = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            const ref = new Ref(4, 4);
            ref.setCell(board, '♙');
            expect(board[4][4]).to.equal('♙');
        });
        it("should return previous cell contents", function() {
            const board = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            let ref = new Ref(1, 4);
            const old = ref.setCell(board, '♙');
            expect(old).to.equal('♟');
        });
    });
});
