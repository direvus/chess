// coding: utf-8

const WHITE_PAWN   = "♙"
const BLACK_PAWN   = "♟"
const WHITE_ROOK   = "♖"
const BLACK_ROOK   = "♜"
const WHITE_BISHOP = "♗"
const BLACK_BISHOP = "♝"
const WHITE_KNIGHT = "♘"
const BLACK_KNIGHT = "♞"
const WHITE_QUEEN  = "♕"
const BLACK_QUEEN  = "♛"
const WHITE_KING   = "♔"
const BLACK_KING   = "♚"

const WHITES = WHITE_PAWN + WHITE_ROOK + WHITE_BISHOP + WHITE_KNIGHT + WHITE_QUEEN + WHITE_KING;
const BLACKS = BLACK_PAWN + BLACK_ROOK + BLACK_BISHOP + BLACK_KNIGHT + BLACK_QUEEN + BLACK_KING;
const PAWNS = WHITE_PAWN + BLACK_PAWN;
const ROOKS = WHITE_ROOK + BLACK_ROOK;
const KNIGHTS = WHITE_KNIGHT + BLACK_KNIGHT;
const BISHOPS = WHITE_BISHOP + BLACK_BISHOP;
const QUEENS = WHITE_QUEEN + BLACK_QUEEN;
const KINGS = WHITE_KING + BLACK_KING;

const PROMOTIONS = [
    WHITE_QUEEN + WHITE_KNIGHT + WHITE_ROOK + WHITE_BISHOP,
    BLACK_QUEEN + BLACK_KNIGHT + BLACK_ROOK + BLACK_BISHOP];

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
        if (this.row >= 0 && this.row < board.length) {
            const boardRow = board[this.row];
            if (this.col >= 0 && this.col < boardRow.length) {
                return boardRow[this.col];
            }
        }
        return null;
    }

    setCell(board, value) {
        const old = this.getCell(board);
        if (old) {
            board[this.row][this.col] = value;
        }
        return old;
    }

    equals(ref) {
        return (this.row == ref.row && this.col == ref.col);
    }

    diff(ref) {
        return [this.row - ref.row, this.col - ref.col];
    }

    add(rows, cols) {
        return new Ref(this.row + rows, this.col + cols);
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

    copyBoard() {
        let copy = [];
        this.board.forEach(row => {
            copy.push(row.slice());
        });
        return copy;
    }

    move(from, to, promotion=0) {
        /*
         * Execute a move in this game, if is it legal.
         *
         * We call validateMove() to do all the heavy lifting of finding out
         * whether the move is legal, and determining the new board state that
         * results from the move.
         *
         * If successful, we update the board, increment the turn counter, and
         * append the details of the move and new board state to the move
         * listing.
         *
         * Arguments:
         * from: a Ref to the departing square
         * to: a Ref to the arrival square
         * promotion: 0=queen, 1=knight, 2=rook, 3=bishop
         *
         * Returns:
         * True if the move succeeded, false if it was rejected.
         */
        let newBoard = this.validateMove(from, to);
        if (newBoard) {
            const piece = this.get(from);
            this.board = newBoard;
            this.moves = [...this.moves, [piece, from, to, this.board]];
            this.turn += 1;

            return true;
        } else {
            return false;
        }
    }

    validateMove(from, to, promotion=0) {
        /*
         * Assess whether the given move is legal.
         *
         * Arguments:
         * from: a Ref to the departing square
         * to: a Ref to the arrival square
         * promotion: 0=queen, 1=knight, 2=rook, 3=bishop
         *
         * Returns:
         * The resulting board state if the move succeeded, null otherwise.
         */
        const piece = this.get(from);
        const target = this.get(to);
        const side = WHITES.includes(piece);
        const [v, h] = to.diff(from);
        const av = Math.abs(v);
        const ah = Math.abs(h);

        let path = [];
        let result = this.copyBoard();
        const check = this.copyBoard();

        if (target != ' ' && side == WHITES.includes(target)) {
            alert(`Illegal move!  Square ${to.label} is occupied by your own piece.`);
            return null;
        }

        from.setCell(result, ' ');
        to.setCell(result, piece);

        if (KINGS.includes(piece)) {
            if (from.col == 4 && from.row == ((side) ? 7 : 0) && ah == 2 && v == 0) { 
                // Castling
                const rookRef = new Ref(to.row, (h > 0) ? 7 : 0);
                const rook = this.get(rookRef);
                if (rook != ROOKS[(side) ? 0 : 1]) {
                    alert(`Illegal move!  Rook must be present for king to castle.`);
                    return null;
                }
                for (let i = 0; i < this.moves.length; i++) {
                    if (this.moves[i][1].equals(from) || rookRef.getCell(this.moves[i][3]) != rook) {
                        alert(`Illegal move!  Castling is not allowed if the king or rook has previously moved.`);
                        return null;
                    }
                }
                if (h > 0) {
                    [1, 2].forEach(x => path.push(new Ref(from.row, from.col + x)));
                } else {
                    [1, 2, 3].forEach(x => path.push(new Ref(from.row, from.col - x)));
                }
                const rookTo = from.add(0, (h > 0) ? 1 : -1);

                from.setCell(check, ' ');
                rookTo.setCell(check, piece);
                let threat = findCheck(check, side);
                if (threat) {
                    alert(`Illegal move!  This castling would move the king through check from ${threat.getCell(check)} at ${threat.label}.`);
                    return null;
                }

                rookRef.setCell(result, ' ');
                rookTo.setCell(result, rook);
            } else {
                if (av > 1 || ah > 1) {
                    alert(`Illegal move!  King may move one square in any direction, or two squares when castling.`);
                    return null;
                }
            }
        }
        if (ROOKS.includes(piece)) {
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
                return null;
            }
        }
        if (BISHOPS.includes(piece)) {
            if (ah == av) {
                const hs = (h < 0) ? -1 : 1;
                const vs = (v < 0) ? -1 : 1;
                for (let i = vs, j = hs; i != v; (i += vs) && (j += hs)) {
                    path.push(new Ref(from.row + i, from.col + j));
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Bishop may only move diagonally.`);
                return null;
            }
        }
        if (QUEENS.includes(piece)) {
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
                return null;
            }
        }
        if (KNIGHTS.includes(piece)) {
            if (!(av == 2 && ah == 1) && !(av == 1 && ah == 2)) {
                alert(`Illegal move!  Invalid target for knight.`);
                return null;
            }
        }
        if (PAWNS.includes(piece)) {
            const step = (side) ? -1 : 1;
            let capture = (target != ' ' && WHITES.includes(target) != side);

            if (h == 0 && v == step) {
                // Single move forward.
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return null;
                }
            } else if (h == 0 && v == (step * 2)) {
                // Double move forward.
                if (from.row != ((side) ? 6 : 1)) {
                    alert(`Illegal move!  Pawn may not advance two squares, except as its initial move.`);
                    return null;
                }
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return null;
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
                            PAWNS.includes(lastMove[0]) &&
                            lastH == 0 && Math.abs(lastV) == 2) {
                        capture = true;
                        lastMove[2].setCell(result, ' ');
                    }
                }
                if (!capture) {
                    alert(`Illegal move!  Pawn may only move diagonally to capture.`);
                    return null;
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Pawn may only move forward, up to two spaces initially and one space otherwise, or diagonally to capture.`);
                return null;
            }

            if (to.row == ((side) ? 0 : 7)) {
                to.setCell(result, PROMOTIONS[(side) ? 0 : 1][promotion]);
            }
        }
        if (path.length > 0) {
            // Check for obstructions
            for (let i = 0; i < path.length; i++) {
                if (!this.isEmpty(path[i])) {
                    alert(`Illegal move!  Movement is blocked by another piece at ${path[i].label}.`);
                    return null;
                }
            }
        }
        // Does this move place the player's king in check?
        let threat = findCheck(result, side);
        if (threat) {
            alert(`Illegal move!  This move would place the king in check from ${threat.getCell(result)} at ${threat.label}.`);
            return null;
        }

        return result;
    }
}

export function findCheck(board, side) {
    /*
     * Find whether the given side's king is in check.
     *
     * Arguments:
     * board: a board state
     * side: which king to test for check (true = white, false = black)
     *
     * Returns:
     * Ref of the first identified threatening piece if the king is in check,
     * null otherwise.
     */
    const piece = KINGS[(side) ? 0 : 1];
    let target = null;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] == piece) {
                target = new Ref(r, c);
            }
        }
    }

    if (target == null) {
        console.log(`Error: ${piece} not found when testing for check.`);
        return false;
    }

    // Knights
    let vectors = [
        [ 1,  2],
        [ 2,  1],
        [ 2, -1],
        [ 1, -2],
        [-1, -2],
        [-2, -1],
        [-2,  1],
        [-1,  2]];
    for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i]
        const ref = target.add(v[0], v[1]);
        const piece = ref.getCell(board);
        if (KNIGHTS.includes(piece) && WHITES.includes(piece) != side) {
            return ref;
        }
    }

    // Pawns
    vectors = [
        [(side) ? -1 : 1,  1],
        [(side) ? -1 : 1, -1]];
    for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i]
        const ref = target.add(v[0], v[1]);
        const piece = ref.getCell(board);
        if (PAWNS.includes(piece) && WHITES.includes(piece) != side) {
            return ref;
        }
    }

    vectors = [
        [ 0,  1],
        [ 1,  1],
        [ 1,  0],
        [ 1, -1],
        [ 0, -1],
        [-1, -1],
        [-1,  0],
        [-1,  1]];
    for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i]
        const ref = target.add(v[0], v[1]);
        const piece = ref.getCell(board);
        if (KINGS.includes(piece) && WHITES.includes(piece) != side) {
            return ref;
        }
    }

    const len = board.length;
    const row = board[target.row];
    for (let i = 0, step = 1; i < 2; i++) {
        // Vertical
        for (let r = target.row + step; r >= 0 && r < len; r += step) {
            const ref = new Ref(r, target.col);
            const piece = ref.getCell(board);
            if (piece != ' ') {
                if (WHITES.includes(piece) == side) {
                    break;
                } else if ((ROOKS + QUEENS).includes(piece)) {
                    return ref;
                }
            }
        }
        // Horizontal
        for (let c = target.col + step; c >= 0 && c < row.length; c += step) {
            const ref = new Ref(target.row, c);
            const piece = ref.getCell(board);
            if (piece != ' ') {
                if (WHITES.includes(piece) == side) {
                    break;
                } else if ((ROOKS + QUEENS).includes(piece)) {
                    return ref;
                }
            }
        }
        let h = step;
        let v = step;
        for (let j = 0; j < 2; j++) {
            let ref = target.add(v, h);
            let piece = ref.getCell(board);
            while (piece) {
                if (piece != ' ') {
                    if (WHITES.includes(piece) == side) {
                        break;
                    } else if ((BISHOPS + QUEENS).includes(piece)) {
                        return ref;
                    }
                }
                ref = ref.add(v, h);
                piece = ref.getCell(board);
            }
            v = -step;
        }
        step = -step;
    }

    return null;
}
