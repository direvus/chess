/* coding: utf-8 */
/* eslint-env mocha */
import {expect} from 'chai';
import {
    Ref, Game, copyBoard, findPieces, getPieces, getSide, onSide,
    findCheck, getMoves, inCheckmate, writeTagValuePGN, readPGN
    } from '../src/chess.js';

const INITIAL_BOARD = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']];

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
            const board = INITIAL_BOARD;
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
            const board = INITIAL_BOARD;
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

describe('Game', function() {
    describe('.constructor', function() {
        it("should initialise the game", function() {
            const g = new Game();
            expect(g.board).to.deep.equal(INITIAL_BOARD);
            expect(g.moves).to.be.an('array');
            expect(g.moves).to.be.empty;
            expect(g.turn).to.equal(1);
        });
    });
});

describe('copyBoard', function() {
    it("should copy a game board", function() {
        const copy = copyBoard(INITIAL_BOARD);
        expect(copy).to.be.an('array');
        expect(copy).to.deep.equal(INITIAL_BOARD);
        expect(copy).to.not.equal(INITIAL_BOARD);
    });
});

describe('findPieces', function() {
    it("should find the white king on the initial board", function() {
        let refs = findPieces(INITIAL_BOARD, '♔');
        expect(refs).to.be.an('array').that.has.lengthOf(1);
        expect(refs[0]).to.be.an.instanceof(Ref);
        expect(refs[0].row).to.equal(7);
        expect(refs[0].col).to.equal(4);
    });
    it("should find both black rooks on the initial board", function() {
        let refs = findPieces(INITIAL_BOARD, '♜');
        expect(refs).to.be.an('array').that.has.lengthOf(2);
        expect(refs[0]).to.be.an.instanceof(Ref);
        expect(refs[0].row).to.equal(0);
        expect(refs[0].col).to.equal(0);
        expect(refs[1]).to.be.an.instanceof(Ref);
        expect(refs[1].row).to.equal(0);
        expect(refs[1].col).to.equal(7);
    });
    it("should find all bishops on the initial board", function() {
        let refs = findPieces(INITIAL_BOARD, '♝♗');
        expect(refs).to.be.an('array').that.has.lengthOf(4);
        expect(refs[0]).to.be.an.instanceof(Ref);
        expect(refs[0].row).to.equal(0);
        expect(refs[0].col).to.equal(2);
        expect(refs[1]).to.be.an.instanceof(Ref);
        expect(refs[1].row).to.equal(0);
        expect(refs[1].col).to.equal(5);
        expect(refs[2]).to.be.an.instanceof(Ref);
        expect(refs[2].row).to.equal(7);
        expect(refs[2].col).to.equal(2);
        expect(refs[3]).to.be.an.instanceof(Ref);
        expect(refs[3].row).to.equal(7);
        expect(refs[3].col).to.equal(5);
    });
});

describe('getPieces', function() {
    it("should return all pieces on the initial board", function() {
        let pieces = getPieces(INITIAL_BOARD);
        expect(pieces).to.be.an('array').that.has.lengthOf(32);
        expect(pieces.join('')).to.equal('♔♕♖♖♗♗♘♘♙♙♙♙♙♙♙♙♚♛♜♜♝♝♞♞♟♟♟♟♟♟♟♟');
    });
});

describe('getSide', function() {
    it("should return the side of each valid piece", function() {
        const pieces = {
            '♔': true,
            '♕': true,
            '♖': true,
            '♗': true,
            '♘': true,
            '♙': true,
            '♚': false,
            '♛': false,
            '♜': false,
            '♝': false,
            '♞': false,
            '♟': false};
        for (let piece in pieces) {
            expect(getSide(piece)).to.equal(pieces[piece]);
        }
    });
    it("should return null for an invalid piece", function() {
        expect(getSide(' ')).to.be.null;
    });
});

describe('onSide', function() {
    it("should return whether each piece is on each side", function() {
        // piece: [white, black, neither]
        const pieces = {
            ' ': [false, false, true],
            '♔': [true, false, false],
            '♕': [true, false, false],
            '♖': [true, false, false],
            '♗': [true, false, false],
            '♘': [true, false, false],
            '♙': [true, false, false],
            '♚': [false, true, false],
            '♛': [false, true, false],
            '♜': [false, true, false],
            '♝': [false, true, false],
            '♞': [false, true, false],
            '♟': [false, true, false]};
        for (let piece in pieces) {
            const [white, black, none] = pieces[piece];
            expect(onSide(piece, true)).to.equal(white);
            expect(onSide(piece, false)).to.equal(black);
            expect(onSide(piece, null)).to.equal(none);
        }
    });
});

describe('findCheck', function() {
    it("should identify a vertical queen check", function() {
        const board = [
            [' ',' ',' ',' ','♛',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(0);
        expect(check.col).to.equal(4);
    });
    it("should identify a horizontal queen check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ','♛',' ']];
        const check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(7);
        expect(check.col).to.equal(6);
    });
    it("should identify a diagonal queen check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ','♛',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(4);
        expect(check.col).to.equal(1);
    });
    it("should identify a vertical rook check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♖',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(6);
        expect(check.col).to.equal(4);
    });
    it("should identify a horizontal rook check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♚',' ',' ',' ',' ',' ',' ','♖'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(3);
        expect(check.col).to.equal(7);
    });
    it("should identify a bishop check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ','♔',' '],
            [' ',' ',' ',' ',' ','♝',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(2);
        expect(check.col).to.equal(5);
    });
    it("should identify a SSE knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♘',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(6);
        expect(check.col).to.equal(3);
    });
    it("should identify a SSW knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ','♘',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(6);
        expect(check.col).to.equal(1);
    });
    it("should identify a WSW knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            ['♘',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(5);
        expect(check.col).to.equal(0);
    });
    it("should identify a WNW knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♘',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(3);
        expect(check.col).to.equal(0);
    });
    it("should identify a NNW knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ','♘',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(2);
        expect(check.col).to.equal(1);
    });
    it("should identify a NNE knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♘',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(2);
        expect(check.col).to.equal(3);
    });
    it("should identify a ENE knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♘',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(3);
        expect(check.col).to.equal(4);
    });
    it("should identify a ESE knight check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♘',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(5);
        expect(check.col).to.equal(4);
    });
    it("should identify a mutual king check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♔',' ',' ',' ',' '],
            [' ',' ','♚',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        let check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(4);
        expect(check.col).to.equal(2);

        check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(3);
        expect(check.col).to.equal(3);
    });
    it("should identify a black pawn check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♟',' ',' ',' ',' ',' '],
            [' ',' ',' ','♔',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        let check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(2);
        expect(check.col).to.equal(2);
    });
    it("should identify a white pawn check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♚',' ',' ',' ',' '],
            [' ',' ','♙',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        let check = findCheck(board, false);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(4);
        expect(check.col).to.equal(2);
    });
    it("should identify a multiple check", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ','♛',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ','♟',' ',' ',' ',' ',' '],
            [' ',' ',' ','♔',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        let check = findCheck(board, true);
        expect(check).to.be.an.instanceof(Ref);
        expect(check.row).to.equal(2);
        expect(check.col).to.equal(2);
    });
    it("should identify a non-check", function() {
        const board = [
            [' ',' ',' ',' ',' ','♛',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♟',' ',' ',' ',' '],
            [' ',' ',' ','♔',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        let check = findCheck(board, true);
        expect(check).to.be.null;
    });
});

describe('getMoves', function() {
    it("should identify all white pawn moves", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const moves = getMoves(board, new Ref(6, 4));
        expect(moves).to.be.an('array').that.has.lengthOf(4);
        expect(moves).to.have.deep.members([
            new Ref(5, 3),
            new Ref(5, 5),
            new Ref(5, 4),
            new Ref(4, 4)]);
    });
    it("should identify all black pawn moves", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ','♟',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const moves = getMoves(board, new Ref(1, 1));
        expect(moves).to.be.an('array').that.has.lengthOf(4);
        expect(moves).to.have.deep.members([
            new Ref(2, 1),
            new Ref(3, 1),
            new Ref(2, 0),
            new Ref(2, 2)]);
    });
});

describe('inCheckmate', function() {
    it("should return false for non-check", function() {
        const board = INITIAL_BOARD;
        expect(inCheckmate(board, true, [])).to.be.false;
        expect(inCheckmate(board, false, [])).to.be.false;
    });
    it("should return false for king escape", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ','♛',' ']];
        expect(inCheckmate(board, true, [])).to.be.false;
    });
    it("should return false for captureable threat", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♟',' ','♖',' ',' '],
            [' ',' ',' ',' ','♖',' ',' ','♚']];
        expect(inCheckmate(board, false, [])).to.be.false;
    });
    it("should return false for blockable threat", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♝',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ','♖',' ',' '],
            [' ',' ',' ',' ','♖',' ',' ','♚']];
        expect(inCheckmate(board, false, [])).to.be.false;
    });
    it("should return true for fool's mate", function() {
        const board = [
            ['♜','♞','♝',' ','♚','♝','♞','♜'],
            ['♟','♟','♟','♟',' ','♟','♟','♟'],
            [' ',' ',' ',' ','♟',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ','♙','♛'],
            [' ',' ',' ',' ',' ','♙',' ',' '],
            ['♙','♙','♙','♙','♙',' ',' ','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖']];
        expect(inCheckmate(board, true, [])).to.be.true;
    });
    it("should return true for double rook mate", function() {
        const board = [
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ','♖',' ',' '],
            [' ',' ',' ',' ','♖',' ',' ','♚']];
        expect(inCheckmate(board, false, [])).to.be.true;
    });
});

describe('writeTagValuePGN', function() {
    it("should double quote string values", function() {
        expect(writeTagValuePGN("ABCDEF")).to.be.equal('"ABCDEF"');
    });
    it("should backslash-escape double quotes", function() {
        expect(writeTagValuePGN('"ABCDEF"')).to.be.equal('"\\"ABCDEF\\""');
    });
    it("should backslash-escape backslashes", function() {
        expect(writeTagValuePGN('ABC\\DEF')).to.be.equal('"ABC\\\\DEF"');
    });
    it("should strip out non-printing characters and tabs", function() {
        expect(writeTagValuePGN("\x01ABC\tDEF\x02")).to.be.equal('"ABCDEF"');
    });
});

describe('readPGN', function() {
    it("should read the Fischer/Spassky sample game", function() {
        const source = `[Event "F/S Return Match"] 
            [Site "Belgrade, Serbia JUG"] 
            [Date "1992.11.04"] 
            [Round "29"] 
            [White "Fischer, Robert J."]
            [Black "Spassky, Boris V."] 
            [Result "1/2-1/2"] 

            1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3
            O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15.
            Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21.
            Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7
            27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33.
            f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5
            40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1/2-1/2`;
        const game = readPGN(source);
        expect(game).to.not.be.null;
        expect(game.tags).to.have.keys(['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result']);
        expect(game.moves).to.be.an('array').that.has.lengthOf(85);
    });
    it("should read basic annotations", function() {
        const source = `
            1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5!? a6?!`;
        const game = readPGN(source);
        expect(game).to.not.be.null;
        expect(game.moves).to.be.an('array').that.has.lengthOf(6);
        expect(game.nags).to.not.be.null;
        expect(game.nags).to.not.be.empty;
        expect(game.nags[0]).to.equal(1);
        expect(game.nags[1]).to.equal(2);
        expect(game.nags[2]).to.equal(3);
        expect(game.nags[3]).to.equal(4);
        expect(game.nags[4]).to.equal(5);
        expect(game.nags[5]).to.equal(6);
    });
    it("should read numeric annotations", function() {
        const source = `
            1. e4 $1 e5 $2 2. Nf3 $3 Nc6 $4 3. Bb5 $5 a6 $6`;
        const game = readPGN(source);
        expect(game).to.not.be.null;
        expect(game.moves).to.be.an('array').that.has.lengthOf(6);
        expect(game.nags).to.not.be.null;
        expect(game.nags).to.not.be.empty;
        expect(game.nags[0]).to.equal(1);
        expect(game.nags[1]).to.equal(2);
        expect(game.nags[2]).to.equal(3);
        expect(game.nags[3]).to.equal(4);
        expect(game.nags[4]).to.equal(5);
        expect(game.nags[5]).to.equal(6);
    });
    it("should throw an error for malformed tags", function() {
        const source = `[Event Event Event]`;
        expect(() => readPGN(source)).to.throw();
    });
});
