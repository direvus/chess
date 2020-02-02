/* coding: utf-8 */
/* eslint-env mocha */
import {expect} from 'chai';
import {
    Ref, Move, Game, copyBoard, findPieces, getPieces, getSide, onSide,
    findCheck, getMoves, validateMove, inCheckmate, inStalemate,
    writeTagValuePGN, readPGN, parseSAN
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
    describe('#initialise', function() {
        it("should re-initialise the game", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            g.initialise();
            expect(g.board).to.deep.equal(INITIAL_BOARD);
            expect(g.moves).to.be.an('array');
            expect(g.moves).to.be.empty;
            expect(g.turn).to.equal(1);
        });
    });
    describe('#copy', function() {
        it("should copy the game", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            g.tags["Event"] = "Test game";
            g.result = 0.5;

            const copy = g.copy();
            expect(copy).to.deep.equal(g);
        });
    });
    describe('#copyBoard', function() {
        it("should copy the board", function() {
            const g = new Game();
            g.move(new Ref(7, 1), new Ref(5, 2));

            const copy = g.copyBoard();
            expect(copy).to.deep.equal(g.board);
        });
    });
    describe('#copyMoves', function() {
        it("should copy the move history", function() {
            const g = new Game();
            g.move(new Ref(7, 1), new Ref(5, 2));

            const copy = g.copyMoves();
            expect(copy).to.deep.equal(g.moves);
        });
    });
    describe('#copyTags', function() {
        it("should copy the tags", function() {
            const g = new Game();
            g.tags["Event"] = "Test game";

            const copy = g.copyTags();
            expect(copy).to.deep.equal(g.tags);
        });
    });
    describe('#get', function() {
        it("should return a cell's contents", function() {
            const g = new Game();
            const ref = new Ref(6, 4);
            const piece = g.get(ref);
            expect(piece).to.equal('♙');
        });
        it("should return null for invalid cells", function() {
            const g = new Game();
            const ref = new Ref(8, 4);
            const piece = g.get(ref);
            expect(piece).to.be.null;
        });
    });
    describe('#set', function() {
        it("should set a cell's contents", function() {
            const g = new Game();
            const ref = new Ref(4, 4);
            g.set(ref, '♙');
            expect(g.board[4][4]).to.equal('♙');
        });
        it("should return the previous cell's contents", function() {
            const g = new Game();
            const ref = new Ref(0, 4);
            const prev = g.set(ref, '♔');
            expect(prev).to.equal('♚');
        });
        it("should return null for invalid cells", function() {
            const g = new Game();
            const ref = new Ref(-1, 4);
            const prev = g.set(ref, '♔');
            expect(prev).to.be.null;
        });
    });
    describe('#isEmpty', function() {
        it("should return whether a cell is empty", function() {
            const g = new Game();
            const empty = [
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false]];

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const ref = new Ref(r, c);
                    expect(g.isEmpty(ref)).to.equal(empty[r][c]);
                }
            }
        });
        it("should return null for invalid cells", function() {
            const g = new Game();
            const ref = new Ref(-1, 4);
            const empty = g.isEmpty(ref);
            expect(empty).to.be.null;
        });
    });
    describe('#selectTurn', function() {
        it("should select a valid turn", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            g.move(new Ref(0, 1), new Ref(2, 2));
            expect(g.turn).to.equal(3);

            g.selectTurn(0);
            expect(g.turn).to.equal(1);
            expect(g.board[6][4]).to.equal('♙');

            g.selectTurn(1);
            expect(g.turn).to.equal(2);
            expect(g.board[0][1]).to.equal('♞');

            g.selectTurn(2);
            expect(g.turn).to.equal(3);
            expect(g.board[2][2]).to.equal('♞');
        });
        it("should do nothing for the current turn", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            g.move(new Ref(0, 1), new Ref(2, 2));

            const orig = g.copy();
            g.selectTurn(2);
            expect(g).to.deep.equal(orig);
        });
        it("should do nothing for an invalid turn", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            g.move(new Ref(0, 1), new Ref(2, 2));

            const orig = g.copy();
            g.selectTurn(5);
            expect(g).to.deep.equal(orig);

            g.selectTurn(-1);
            expect(g).to.deep.equal(orig);
        });
    });
    describe('#move', function() {
        it("should execute a valid move", function() {
            const g = new Game();
            const result = g.move(new Ref(6, 4), new Ref(4, 4));
            expect(result).to.be.true;
            expect(g.moves).to.be.an('array').that.has.lengthOf(1);
            expect(g.turn).to.equal(2);
            expect(g.result).to.be.null;
            expect(g.board).to.deep.equal([
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙',' ','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']]);
        });
        it("should not execute an illegal move", function() {
            const g = new Game();
            const from = new Ref(6, 4);
            const to = new Ref(6, 3);
            expect(() => g.move(from, to)).to.throw;
        });
        it("should promote to queen if indicated", function() {
            const g = new Game();
            g.board = [
                [' ','♚',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙',' ','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            g.move(new Ref(1, 4), new Ref(0, 4), 0);
            expect(g.board[0][4]).to.equal('♕');
        });
        it("should promote to knight if indicated", function() {
            const g = new Game();
            g.board = [
                [' ','♚',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ','♟',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']];
            g.move(new Ref(6, 1), new Ref(7, 1), 1);
            expect(g.board[7][1]).to.equal('♞');
        });
        it("should promote to rook if indicated", function() {
            const g = new Game();
            g.board = [
                [' ','♚',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙',' ','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']];
            g.move(new Ref(1, 4), new Ref(0, 4), 2);
            expect(g.board[0][4]).to.equal('♖');
        });
        it("should promote to bishop if indicated", function() {
            const g = new Game();
            g.board = [
                [' ','♚',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ','♟',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']];
            g.move(new Ref(6, 1), new Ref(7, 1), 3);
            expect(g.board[7][1]).to.equal('♝');
        });
    });
    describe('#getMoveSAN', function() {
        it("should return a simple pawn move", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4));
            const san = g.getMoveSAN(0);
            expect(san).to.equal('e4');
        });
        it("should return a simple knight move", function() {
            const g = new Game();
            g.move(new Ref(7, 1), new Ref(5, 0));
            const san = g.getMoveSAN(0);
            expect(san).to.equal('Na3');
        });
        it("should return special notation for castling", function() {
            const g = new Game();
            g.move(new Ref(6, 3), new Ref(4, 3)); // d4
            g.move(new Ref(1, 4), new Ref(2, 4)); // e6
            g.move(new Ref(7, 2), new Ref(5, 4)); // Be3
            g.move(new Ref(0, 5), new Ref(2, 3)); // Bd6
            g.move(new Ref(7, 3), new Ref(6, 3)); // Qd2
            g.move(new Ref(0, 6), new Ref(2, 7)); // Nh6
            g.move(new Ref(7, 1), new Ref(5, 0)); // Na3
            g.move(new Ref(0, 4), new Ref(0, 6)); // O-O
            g.move(new Ref(7, 4), new Ref(7, 2)); // O-O-O
            expect(g.getMoveSAN(7)).to.equal('O-O');
            expect(g.getMoveSAN(8)).to.equal('O-O-O');
        });
        it("should disambiguate by piece", function() {
            const g = new Game();
            g.move(new Ref(7, 1), new Ref(5, 0)); // Na3
            g.move(new Ref(1, 4), new Ref(2, 4)); // e6
            g.move(new Ref(6, 4), new Ref(4, 4)); // e4
            g.move(new Ref(0, 6), new Ref(2, 7)); // Nh6
            g.move(new Ref(7, 5), new Ref(4, 2)); // Bc4
            const san = g.getMoveSAN(4);
            expect(san).to.equal('Bc4');
        });
        it("should disambiguate by file for same piece", function() {
            const g = new Game();
            g.move(new Ref(7, 1), new Ref(5, 2)); // Nc3
            g.move(new Ref(1, 4), new Ref(2, 4)); // e5
            g.move(new Ref(6, 4), new Ref(4, 4)); // e4
            g.move(new Ref(0, 6), new Ref(2, 7)); // Nh6
            g.move(new Ref(7, 6), new Ref(6, 4)); // Nge2
            const san = g.getMoveSAN(4);
            expect(san).to.equal('Nge2');
        });
        it("should disambiguate by rank for same piece & file", function() {
            const g = new Game();
            g.move(new Ref(6, 3), new Ref(5, 3)); // d3
            g.move(new Ref(1, 4), new Ref(2, 4)); // e5
            g.move(new Ref(7, 1), new Ref(6, 3)); // Nd2
            g.move(new Ref(1, 3), new Ref(2, 3)); // d6
            g.move(new Ref(7, 6), new Ref(5, 5)); // Nf3
            g.move(new Ref(1, 5), new Ref(2, 5)); // f6
            g.move(new Ref(5, 5), new Ref(4, 3)); // Nd4
            g.move(new Ref(0, 6), new Ref(2, 7)); // Nh6
            g.move(new Ref(6, 3), new Ref(5, 5)); // Nd2f3
            const san = g.getMoveSAN(8);
            expect(san).to.equal('N2f3');
        });
        it("should disambiguate by square for same piece, file", function() {
            const g = new Game();
            g.board = [
                [' ',' ',' ',' ',' ',' ','♕','♕'],
                [' ',' ',' ',' ',' ',' ',' ','♕'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♚',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']];
            g.move(new Ref(5, 0), new Ref(4, 0));
            g.move(new Ref(0, 7), new Ref(1, 6));
            const san = g.getMoveSAN(1);
            expect(san).to.equal('Qh8g7');
        });
        it("should include captures", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4)); // e4
            g.move(new Ref(1, 3), new Ref(3, 3)); // d5
            g.move(new Ref(4, 4), new Ref(3, 3)); // exd5
            g.move(new Ref(0, 6), new Ref(2, 5)); // Nf6
            g.move(new Ref(7, 1), new Ref(5, 0)); // Na3
            g.move(new Ref(2, 5), new Ref(3, 3)); // Nxd5
            expect(g.getMoveSAN(2)).to.equal('exd5');
            expect(g.getMoveSAN(5)).to.equal('Nxd5');
        });
        it("should include promotions", function() {
            // desperado pawn scenario; capture to NW corner
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4)); // e4
            g.move(new Ref(1, 3), new Ref(3, 3)); // d5
            g.move(new Ref(4, 4), new Ref(3, 3)); // exd5
            g.move(new Ref(1, 2), new Ref(2, 2)); // c6
            g.move(new Ref(3, 3), new Ref(2, 2)); // dxc6
            g.move(new Ref(0, 6), new Ref(2, 7)); // Nh6
            g.move(new Ref(2, 2), new Ref(1, 1)); // cxb7
            g.move(new Ref(2, 7), new Ref(0, 6)); // Ng8
            g.move(new Ref(1, 1), new Ref(0, 0)); // bxa8=Q
            expect(g.getMoveSAN(8)).to.equal('bxa8=Q');

            g.selectTurn(8);
            g.move(new Ref(1, 1), new Ref(0, 0), 1); // bxa8=N
            expect(g.getMoveSAN(8)).to.equal('bxa8=N');

            g.selectTurn(8);
            g.move(new Ref(1, 1), new Ref(0, 0), 2); // bxa8=R
            expect(g.getMoveSAN(8)).to.equal('bxa8=R');

            g.selectTurn(8);
            g.move(new Ref(1, 1), new Ref(0, 0), 3); // bxa8=B
            expect(g.getMoveSAN(8)).to.equal('bxa8=B');
        });
        it("should include check indicator", function() {
            const g = new Game();
            g.move(new Ref(6, 3), new Ref(4, 3)); // d4
            g.move(new Ref(1, 4), new Ref(2, 4)); // e6
            g.move(new Ref(7, 1), new Ref(5, 0)); // Na3
            g.move(new Ref(0, 5), new Ref(4, 1)); // Bb4+
            expect(g.getMoveSAN(3)).to.equal('Bb4+');
            // TOOD
        });
        it("should include checkmate indicator", function() {
            const g = new Game();
            g.move(new Ref(6, 5), new Ref(5, 5)); // f3
            g.move(new Ref(1, 4), new Ref(2, 4)); // e6
            g.move(new Ref(6, 6), new Ref(4, 6)); // g4
            g.move(new Ref(0, 3), new Ref(4, 7)); // Qh4#
            expect(g.getMoveSAN(3)).to.equal('Qh4#');
        });
        it("should include numeric annotations", function() {
            const g = new Game();
            g.move(new Ref(6, 4), new Ref(4, 4), 0, 1);
            const san = g.getMoveSAN(0);
            expect(san).to.equal('e4 $1');
        });
    });
    describe('#getNonSTRTags', function() {
        it("should return tags that are not STR", function() {
            const g = new Game();
            g.tags["Notes"] = "Test";
            g.tags["Total time"] = "29:00";

            const tags = g.getNonSTRTags();
            expect(tags).to.deep.equal({
                "Notes": "Test",
                "Total time": "29:00"});
        });
        it("should return empty object if there are none", function() {
            const g = new Game();
            const tags = g.getNonSTRTags();
            expect(tags).to.deep.equal({});
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

describe('validateMove', function() {
    it("should return [board, capture] for valid moves", function() {
        let board = INITIAL_BOARD;
        let result = validateMove(board, [], new Ref(6, 4), new Ref(5, 4));
        expect(result).to.be.an('array').that.has.lengthOf(2);
        expect(result[0]).to.be.an('array');
        expect(result[0][6][4]).to.equal(' ');
        expect(result[0][5][4]).to.equal('♙');
        expect(result[1]).to.be.a('string');
        expect(result[1]).to.equal(' ');

        board = [
            ['♜','♞','♝','♛','♚','♝','♞','♜'],
            ['♟','♟','♟','♟',' ','♟','♟','♟'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♟',' ',' ',' '],
            [' ',' ',' ','♙',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♙','♙','♙',' ','♙','♙','♙','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖']];
        result = validateMove(board, [], new Ref(4, 3), new Ref(3, 4));
        expect(result[0]).to.be.an('array');
        expect(result[0][4][3]).to.equal(' ');
        expect(result[0][3][4]).to.equal('♙');
        expect(result[1]).to.be.a('string');
        expect(result[1]).to.equal('♟');
    });
    it("should return [null, str] for invalid moves", function() {
        const board = INITIAL_BOARD;
        const result = validateMove(board, [], new Ref(0, 0), new Ref(2, 0));
        expect(result[0]).to.be.null;
        expect(result[1]).to.be.a('string');
    });
    it("should allow all valid white pawn moves", function() {
        // White pawn from initial position
        let board = INITIAL_BOARD;
        let from = new Ref(6, 4);
        let squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false,  true, false, false, false],
            [false, false, false, false,  true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c]);
            }
        }
        // White pawn captures
        board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♟',' ','♟',' ',' '],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        from = new Ref(4, 4);
        squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false,  true,  true,  true, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c]);
                if (move[0] && from.col != to.col) {
                    expect(move[1]).to.equal('♟');
                }
            }
        }
        // White pawn en passant
        board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♟','♙','♟',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const moves = [
            new Move('♟', new Ref(1, 3), new Ref(3, 3), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ','♟',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♟',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']]),
            new Move('♙', new Ref(4, 4), new Ref(3, 4), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ','♟',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♟','♙',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']]),
            new Move('♟', new Ref(1, 5), new Ref(3, 5), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♟','♙','♟',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']])];
        from = new Ref(3, 4);
        squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false,  true,  true, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, moves, from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
                if (move[0] && from.col != to.col) {
                    expect(move[1]).to.equal('♟');
                }
            }
        }
    });
    it("should allow all valid black pawn moves", function() {
        // Black pawn from initial position
        let board = INITIAL_BOARD;
        let from = new Ref(1, 4);
        let squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false,  true, false, false, false],
            [false, false, false, false,  true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c]);
            }
        }
        // Black pawn captures
        board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♟',' ',' ',' '],
            [' ',' ',' ','♙',' ','♙',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        from = new Ref(3, 4);
        squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false,  true,  true,  true, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c]);
                if (move[0] && from.col != to.col) {
                    expect(move[1]).to.equal('♙');
                }
            }
        }
        // Black pawn en passant
        board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♙','♟','♙',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const moves = [
            new Move('♙', new Ref(6, 5), new Ref(4, 5), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♟',' ',' ',' '],
                [' ',' ',' ',' ',' ','♙',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♙',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']]),
            new Move('♟', new Ref(3, 4), new Ref(4, 4), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♟','♙',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♙',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']]),
            new Move('♙', new Ref(6, 3), new Ref(4, 3), ' ', [
                [' ',' ',' ',' ','♚',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ','♙','♟','♙',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♔',' ',' ',' ']])];
        from = new Ref(4, 4);
        squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false,  true,  true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, moves, from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
                if (move[0] && from.col != to.col) {
                    expect(move[1]).to.equal('♙');
                }
            }
        }
    });
    it("should allow normal valid king moves", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♔',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ']];
        const from = new Ref(4, 3);
        const squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false,  true,  true,  true, false, false, false],
            [false, false,  true, false,  true, false, false, false],
            [false, false,  true,  true,  true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
            }
        }
    });
    it("should allow valid castling moves", function() {
        let board = [
            ['♜',' ',' ',' ','♚',' ',' ','♜'],
            ['♟','♟','♟','♛','♟','♟',' ','♟'],
            ['♞',' ',' ','♟','♝','♞','♟','♝'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            ['♘','♙',' ','♗',' ','♕',' ','♘'],
            ['♙','♗','♙','♙',' ','♙','♙','♙'],
            ['♖',' ',' ',' ','♔',' ',' ','♖']];
        let move = validateMove(board, [], new Ref(7, 4), new Ref(7, 2));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.an('array').that.has.lengthOf(8);
        expect(move[0][7]).to.deep.equal(
            [' ',' ','♔','♖',' ',' ',' ','♖']);

        move = validateMove(board, [], new Ref(7, 4), new Ref(7, 6));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.an('array').that.has.lengthOf(8);
        expect(move[0][7]).to.deep.equal(
            ['♖',' ',' ',' ',' ','♖','♔',' ']);

        move = validateMove(board, [], new Ref(0, 4), new Ref(0, 2));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.an('array').that.has.lengthOf(8);
        expect(move[0][0]).to.deep.equal(
            [' ',' ','♚','♜',' ',' ',' ','♜']);

        move = validateMove(board, [], new Ref(0, 4), new Ref(0, 6));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.an('array').that.has.lengthOf(8);
        expect(move[0][0]).to.deep.equal(
            ['♜',' ',' ',' ',' ','♜','♚',' ']);
    });
    it("should disallow castling if the king has moved", function() {
        const board = [
            ['♜',' ',' ',' ','♚',' ',' ','♜'],
            ['♟','♟','♟','♛','♟','♟',' ','♟'],
            ['♞',' ',' ','♟','♝','♞','♟','♝'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            ['♘','♙',' ','♗',' ','♕',' ','♘'],
            ['♙','♗','♙','♙',' ','♙','♙','♙'],
            ['♖',' ',' ',' ','♔',' ',' ','♖']];
        const moves = [
            new Move('♔', new Ref(7, 4), new Ref(7, 5), ' ', [
                ['♜','♞',' ',' ','♚',' ',' ','♜'],
                ['♟','♟','♟','♛','♟','♟',' ','♟'],
                [' ',' ',' ','♟','♝','♞','♟','♝'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                ['♘','♙',' ','♗',' ','♕',' ','♘'],
                ['♙','♗','♙','♙',' ','♙','♙','♙'],
                ['♖',' ',' ',' ',' ','♔',' ','♖']]),
            new Move('♞', new Ref(0, 1), new Ref(2, 0), ' ', [
                ['♜',' ',' ',' ','♚',' ',' ','♜'],
                ['♟','♟','♟','♛','♟','♟',' ','♟'],
                ['♞',' ',' ','♟','♝','♞','♟','♝'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                ['♘','♙',' ','♗',' ','♕',' ','♘'],
                ['♙','♗','♙','♙',' ','♙','♙','♙'],
                ['♖',' ',' ',' ',' ','♔',' ','♖']]),
            new Move('♙', new Ref(7, 5), new Ref(7, 4), ' ', [
                ['♜',' ',' ',' ','♚',' ',' ','♜'],
                ['♟','♟','♟','♛','♟','♟',' ','♟'],
                ['♞',' ',' ','♟','♝','♞','♟','♝'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ','♙',' ',' ',' '],
                ['♘','♙',' ','♗',' ','♕',' ','♘'],
                ['♙','♗','♙','♙',' ','♙','♙','♙'],
                ['♖',' ',' ',' ','♔',' ',' ','♖']])];
        let move = validateMove(board, moves, new Ref(7, 4), new Ref(7, 2));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.null;
    });
    it("should disallow castling through check", function() {
        let board = [
            ['♜',' ',' ',' ','♚',' ',' ','♜'],
            ['♟','♟','♟',' ','♟','♟',' ','♟'],
            ['♞',' ',' ','♟','♝','♞','♟','♝'],
            [' ','♛',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            ['♘','♙',' ',' ',' ',' ',' ','♘'],
            ['♙','♗','♙','♙',' ','♙','♙','♙'],
            ['♖',' ',' ','♕','♔',' ',' ','♖']];
        let move = validateMove(board, [], new Ref(7, 4), new Ref(7, 6));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.null;
    });
    it("should allow all valid queen moves", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♕',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const from = new Ref(4, 3);
        const squares = [
            [false, false, false,  true, false, false, false,  true],
            [ true, false, false,  true, false, false,  true, false],
            [false,  true, false,  true, false,  true, false, false],
            [false, false,  true,  true,  true, false, false, false],
            [ true,  true,  true, false,  true,  true,  true,  true],
            [false, false,  true,  true,  true, false, false, false],
            [false,  true, false,  true, false,  true, false, false],
            [ true, false, false,  true, false, false,  true, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
            }
        }
    });
    it("should allow all valid rook moves", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♜',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const from = new Ref(3, 3);
        const squares = [
            [false, false, false,  true, false, false, false, false],
            [false, false, false,  true, false, false, false, false],
            [false, false, false,  true, false, false, false, false],
            [ true,  true,  true, false,  true,  true,  true,  true],
            [false, false, false,  true, false, false, false, false],
            [false, false, false,  true, false, false, false, false],
            [false, false, false,  true, false, false, false, false],
            [false, false, false,  true, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c]);
            }
        }
    });
    it("should allow all valid knight moves", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♞',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const from = new Ref(4, 3);
        const squares = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false,  true, false,  true, false, false, false],
            [false,  true, false, false, false,  true, false, false],
            [false, false, false, false, false, false, false, false],
            [false,  true, false, false, false,  true, false, false],
            [false, false,  true, false,  true, false, false, false],
            [false, false, false, false, false, false, false, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
            }
        }
    });
    it("should allow all valid bishop moves", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♗',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const from = new Ref(4, 3);
        const squares = [
            [false, false, false, false, false, false, false,  true],
            [ true, false, false, false, false, false,  true, false],
            [false,  true, false, false, false,  true, false, false],
            [false, false,  true, false,  true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false,  true, false,  true, false, false, false],
            [false,  true, false, false, false,  true, false, false],
            [ true, false, false, false, false, false,  true, false]];
        for (let r = 0; r < squares.length; r++) {
            for (let c = 0; c < squares[r].length; c++) {
                const to = new Ref(r, c);
                const move = validateMove(board, [], from, to);
                expect(move).to.be.an('array').that.has.lengthOf(2);
                expect(move[0] != null).to.equal(squares[r][c], `failed on ${r}, ${c}`);
            }
        }
    });
    it("should disallow movement through another piece", function() {
        const board = [
            [' ',' ',' ',' ','♚',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ','♟',' ','♟',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ','♟',' ','♕',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ','♔',' ',' ',' ']];
        const from = new Ref(4, 3);
        let move = validateMove(board, [], from, new Ref(4, 0));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.null;

        move = validateMove(board, [], from, new Ref(1, 3));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.null;

        move = validateMove(board, [], from, new Ref(0, 7));
        expect(move).to.be.an('array').that.has.lengthOf(2);
        expect(move[0]).to.be.null;
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

describe('inStalemate', function() {
    it("should return true for stalemate", function() {
        const board = [
            [' ',' ',' ',' ',' ','♝','♞','♜'],
            [' ',' ',' ',' ','♟',' ','♟','♛'],
            [' ',' ',' ',' ','♕','♟','♚','♜'],
            [' ',' ',' ',' ',' ',' ',' ','♟'],
            [' ',' ',' ',' ',' ',' ',' ','♙'],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            ['♙','♙','♙','♙',' ','♙','♙',' '],
            ['♖','♘','♗',' ','♔','♗','♘','♖']];
        expect(inStalemate(board, false, [])).to.be.true;
    });
    it("should return false for non-stalemates", function() {
        let board = INITIAL_BOARD;
        expect(inStalemate(board, false, [])).to.be.false;

        board = [
            [' ',' ',' ',' ',' ','♝','♞','♜'],
            [' ',' ','♟',' ','♟',' ','♟','♛'],
            [' ',' ',' ',' ','♕','♟','♚','♜'],
            [' ',' ',' ',' ',' ',' ',' ','♟'],
            [' ',' ',' ',' ',' ',' ',' ','♙'],
            [' ',' ',' ',' ','♙',' ',' ',' '],
            ['♙','♙','♙','♙',' ','♙','♙',' '],
            ['♖','♘','♗',' ','♔','♗','♘','♖']];
        expect(inStalemate(board, false, [])).to.be.false;
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
        const source = `1. e4! e5? 2. Nf3!! Nc6?? 3. Bb5!? a6?!`;
        const game = readPGN(source);
        expect(game).to.not.be.null;
        expect(game.moves).to.be.an('array').that.has.lengthOf(6);
        expect(game.moves[0].nag).to.equal(1);
        expect(game.moves[1].nag).to.equal(2);
        expect(game.moves[2].nag).to.equal(3);
        expect(game.moves[3].nag).to.equal(4);
        expect(game.moves[4].nag).to.equal(5);
        expect(game.moves[5].nag).to.equal(6);
    });
    it("should read numeric annotations", function() {
        const source = '1. e4 $1 e5 $2 2. Nf3 $3 Nc6 $4 3. Bb5 $5 a6 $6';
        const game = readPGN(source);
        expect(game).to.not.be.null;
        expect(game.moves).to.be.an('array').that.has.lengthOf(6);
        expect(game.moves[0].nag).to.equal(1);
        expect(game.moves[1].nag).to.equal(2);
        expect(game.moves[2].nag).to.equal(3);
        expect(game.moves[3].nag).to.equal(4);
        expect(game.moves[4].nag).to.equal(5);
        expect(game.moves[5].nag).to.equal(6);
    });
    it("should throw an error for malformed tags", function() {
        const source = `[Event Event Event]`;
        expect(() => readPGN(source)).to.throw();
    });
});

describe('parseSAN', function() {
    it("should read a simple move", function() {
        const move = parseSAN(INITIAL_BOARD, [], 'e4');
        expect(move).to.be.an.instanceof(Move);
        expect(move.piece).to.equal('♙');
        expect(move.from).to.be.an.instanceof(Ref);
        expect(move.from.row).to.equal(6);
        expect(move.from.col).to.equal(4);
        expect(move.to).to.be.an.instanceof(Ref);
        expect(move.to.row).to.equal(4);
        expect(move.to.col).to.equal(4);
    });
    it("should read basic annotations", function() {
        let move = parseSAN(INITIAL_BOARD, [], 'e4!');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(1);

        move = parseSAN(INITIAL_BOARD, [], 'e4?');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(2);

        move = parseSAN(INITIAL_BOARD, [], 'Nf3!!');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(3);

        move = parseSAN(INITIAL_BOARD, [], 'Nf3??');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(4);

        move = parseSAN(INITIAL_BOARD, [], 'a3!?');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(5);

        move = parseSAN(INITIAL_BOARD, [], 'a3?!');
        expect(move).to.be.an.instanceof(Move);
        expect(move.nag).to.equal(6);
    });
    it("should throw an error for invalid moves", function() {
        expect(() => parseSAN(INITIAL_BOARD, [], 'Qd4')).to.throw;
    });
});
