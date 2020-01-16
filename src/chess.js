// coding: utf-8

const white = "♖♗♘♕♔♙"
const black = "♜♞♝♛♚♟"
const pawn = "♙♟"
const rook = "♖♜"
const knight = "♘♞"
const bishop = "♗♝"
const queen = "♕♛"
const king = "♔♚"

export class Ref {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    get rank() {
        return 8 - this.row;
    }

    get file() {
        return String.fromCharCode('a'.charCodeAt(0) + this.col);
    }

    get label() {
        return this.file + this.rank;
    }

    toString() {
        return this.label;
    }

    getCell(board) {
        return board[this.row][this.col];
    }

    equals(ref) {
        return (this.row == ref.row && this.col == ref.col);
    }

    diff(ref) {
        return [this.row - ref.row, this.col - ref.col];
    }

    cmp(ref) {
        if (this.row > ref.row) {
            return -1;
        } else if (this.row > ref.row) {
            return 1;
        }
        if (this.col > ref.col) {
            return -1;
        } else if (this.col < ref.col) {
            return 1;
        }
        return 0;
    }
}

export class Game {
    constructor() {
        this.initialise();
    }

    initialise() {
        this.board = [
            ['♜','♞','♝','♛','♚','♝','♞','♜'],
            ['♟','♟','♟','♟','♟','♟','♟','♟'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♙','♙','♙','♙','♙','♙','♙','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖'],
            ];
        this.moves = [];
        this.turn = 1;
    }

    get(ref) {
      return this.board[ref.row][ref.col];
    }

    set(ref, value) {
        const piece = this.get(ref);
        this.board[ref.row][ref.col] = value;
        return piece;
    }

    isEmpty(ref) {
        return (this.get(ref) == ' ');
    }

    move(from, to) {
        if (this.isLegal(from, to)) {
            const piece = this.get(from);
            const target = this.get(to);

            this.set(from, ' ');
            this.set(to, piece);
            // TODO: en passant
            // TODO: promotion
            // TODO: castling
            this.moves = [...this.moves, [piece, from, to, this.board]];
            this.turn += 1;

            return true;
        } else {
            return false;
        }
    }

    isLegal(from, to) {
        const piece = this.get(from);
        const target = this.get(to);
        const side = white.includes(piece);
        const [v, h] = to.diff(from);
        const av = Math.abs(v);
        const ah = Math.abs(h);

        let path = [];

        if (target != ' ' && side == white.includes(target)) {
            alert(`Illegal move!  Square ${to.label} is occupied by your own piece.`);
            return false;
        }
        if (king.includes(piece)) {
            if (from.col == 4 && from.row == (side) ? 7 : 0 && ah == 2 && v == 0) { 
                // Castling
                const rookRef = new Ref(to.row, (h > 0) ? 7 : 0);
                if (!rook.includes(board.get(rookRef))) {
                    alert(`Illegal move!  Rook must be present for king to castle.`);
                    return false;
                }
                for (let i = 0; i < this.moves.length; i++) {
                    if (this.moves[i][1].equals(from) || this.moves[i][1].equals(rookRef)) {
                        alert(`Illegal move!  Castling is not allowed if the king or rook has previously moved.`);
                        return false;
                    }
                }
                if (h > 0) {
                    [1, 2].forEach(x => path.push(new Ref(from.row, from.col + x)));
                } else {
                    [1, 2, 3].forEach(x => path.push(new Ref(from.row, from.col - x)));
                }
                // TODO: may not castle if king moves through a threatened square.
            } else {
                if (av > 1 || ah > 1) {
                    alert(`Illegal move!  King may move one square in any direction, or two squares when castling.`);
                    return false;
                }
            }
        }
        if (rook.includes(piece)) {
            if (v == 0) {
                // Horizontal movement
                const step = (h < 0) ? -1 : 1;
                for (let i = from.col + step; i != to.col; i += step) {
                    path.push(new Ref(from.row, i));
                }
            } else if (h == 0) {
                // Vertical movement
                const step = (v < 0) ? -1 : 1;
                for (let i = from.row + step; i != to.row; i += step) {
                    path.push(new Ref(i, from.col));
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Rook may only move either horizontally or vertically.`);
                return false;
            }
        }
        if (bishop.includes(piece)) {
            if (ah == av) {
                const hs = (h < 0) ? -1 : 1;
                const vs = (v < 0) ? -1 : 1;
                for (let i = vs, j = hs; i != v; (i += vs) && (j += hs)) {
                    path.push(new Ref(from.row + i, from.col + j));
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Bishop may only move diagonally.`);
                return false;
            }
        }
        if (queen.includes(piece)) {
            const diff = to - from;

            if (v == 0) {
                // Horizontal movement
                const step = (h < 0) ? -1 : 1;
                for (let i = from.col + step; i != to.col; i += step) {
                    path.push(new Ref(from.row, i));
                }
            } else if (h == 0) {
                // Vertical movement
                const step = (v < 0) ? -1 : 1;
                for (let i = from.row + step; i != to.row; i += step) {
                    path.push(new Ref(i, from.col));
                }
            } else if (ah == av) {
                const hs = (h < 0) ? -1 : 1;
                const vs = (v < 0) ? -1 : 1;
                for (let i = vs, j = hs; i != v; (i += vs) && (j += hs)) {
                    path.push(new Ref(from.row + i, from.col + j));
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Queen may only move horizontally, vertically or diagonally.`);
                return false;
            }
        }
        if (knight.includes(piece)) {
            if (!(av == 2 && ah == 1) && !(av == 1 && ah == 2)) {
                alert(`Illegal move!  Invalid target for knight.`);
                return false;
            }
        }
        if (pawn.includes(piece)) {
            const step = (side) ? -1 : 1;
            let capture = (target != ' ' && white.includes(target) != side);

            if (h == 0 && v == step) {
                // Single move forward.
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return false;
                }
            } else if (h == 0 && v == (step * 2)) {
                // Double move forward.
                if (from.row != ((side) ? 6 : 1)) {
                    alert(`Illegal move!  Pawn may not advance two squares, except as its initial move.`);
                    return false;
                }
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return false;
                }
                path.push(new Ref(from.row + step, from.col));
            } else if (ah == 1 && v == step) {
                /*
                 * Diagonal move forward.
                 *
                 * En passant: if the last piece to move was an enemy pawn, and
                 * it used a double-move, then this piece may capture by moving
                 * diagonally into the space the enemy pawn would have occupied,
                 * had it used a single move.
                 */
                if (this.moves.length > 0) {
                    const lastMove = this.moves[this.moves.length - 1];
                    const [lastV, lastH] = lastMove[1].diff(lastMove[2]);
                    if (to.col == lastMove[2].col &&
                            to.row == (lastMove[2].row + step) &&
                            pawn.includes(lastMove[0]) &&
                            lastH == 0 && Math.abs(lastV) == 2) {
                        capture = true;
                    }
                }
                if (!capture) {
                    alert(`Illegal move!  Pawn may only move diagonally to capture.`);
                    return false;
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Pawn may only move forward, up to two spaces initially and one space otherwise, or diagonally to capture.`);
                return false;
            }
        }
        if (path.length > 0) {
            // Check for obstructions
            for (let i = 0; i < path.length; i++) {
                if (!this.isEmpty(path[i])) {
                    alert(`Illegal move!  Movement is blocked by another piece at ${path[i].label}.`);
                    return false;
                }
            }
        }
        // TODO: test for own king in check
        return true;
    }
}
