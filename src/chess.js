// coding: utf-8

export const WHITE_PAWN   = "♙"
export const BLACK_PAWN   = "♟"
export const WHITE_ROOK   = "♖"
export const BLACK_ROOK   = "♜"
export const WHITE_BISHOP = "♗"
export const BLACK_BISHOP = "♝"
export const WHITE_KNIGHT = "♘"
export const BLACK_KNIGHT = "♞"
export const WHITE_QUEEN  = "♕"
export const BLACK_QUEEN  = "♛"
export const WHITE_KING   = "♔"
export const BLACK_KING   = "♚"

export const WHITES = WHITE_PAWN + WHITE_ROOK + WHITE_BISHOP + WHITE_KNIGHT + WHITE_QUEEN + WHITE_KING;
export const BLACKS = BLACK_PAWN + BLACK_ROOK + BLACK_BISHOP + BLACK_KNIGHT + BLACK_QUEEN + BLACK_KING;
export const PAWNS = WHITE_PAWN + BLACK_PAWN;
export const ROOKS = WHITE_ROOK + BLACK_ROOK;
export const KNIGHTS = WHITE_KNIGHT + BLACK_KNIGHT;
export const BISHOPS = WHITE_BISHOP + BLACK_BISHOP;
export const QUEENS = WHITE_QUEEN + BLACK_QUEEN;
export const KINGS = WHITE_KING + BLACK_KING;

export const PROMOTIONS = [
    WHITE_QUEEN + WHITE_KNIGHT + WHITE_ROOK + WHITE_BISHOP,
    BLACK_QUEEN + BLACK_KNIGHT + BLACK_ROOK + BLACK_BISHOP];

export const SAN_PIECES = {
    "♙": "P",
    "♟": "P",
    "♖": "R",
    "♜": "R",
    "♗": "B",
    "♝": "B",
    "♘": "N",
    "♞": "N",
    "♕": "Q",
    "♛": "Q",
    "♔": "K",
    "♚": "K"};

export const DEAD_POSITIONS = [
    "♔♚",
    "♔♗♚",
    "♔♚♝",
    "♔♘♚",
    "♔♚♞"];

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

    get colour() {
        /*
         * Return the colour of the square.
         *
         * The white squares are odd columns on odd rows, and even columns on
         * even rows.  The black squares are odd columns on even rows, and even
         * columns on odd rows.
         *
         * Returns:
         * false: black square
         * true: white square
         */
        return (this.col % 2) == (this.row % 2);
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
        this.tags = {};
        this.turn = 1;
        this.result = null;
    }

    copy() {
        let copy = new Game();
        copy.board = this.copyBoard();
        copy.moves = this.copyMoves();
        copy.tags = this.copyTags();
        copy.turn = this.turn;
        copy.result = this.result;
        return copy;
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
        return copyBoard(this.board);
    }

    copyMoves() {
        let copy = [];
        this.moves.forEach(move => {
            copy.push(move.slice());
        });
        return copy;
    }

    copyTags() {
        let copy = {};
        for (let k in this.tags) {
            copy[k] = this.tags[k];
        }
        return copy;
    }

    selectTurn(turn) {
        /*
         * Set the game state as it was at the end of the given turn.
         */
        const index = turn - 1;
        const next = turn + 1;
        if (index >= 0 && index < this.moves.length && next != this.turn) {
            this.turn = next;
            this.board = copyBoard(this.moves[index][4]);
            this.result = this.getResult();
        }
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
         * Otherwise, we raise the error message as an alert.
         *
         * Arguments:
         * from: a Ref to the departing square
         * to: a Ref to the arrival square
         * promotion: 0=queen, 1=knight, 2=rook, 3=bishop
         *
         * Returns:
         * True if the move succeeded, false if it was rejected.
         */
        let [newBoard, capture] = this.validateMove(from, to, promotion);
        if (newBoard) {
            const piece = this.get(from);
            this.board = newBoard;
            /*
             * In case we've backtracked, erase future moves before recording the
             * new one.
             */
            const pastMoves = this.moves.slice(0, this.turn - 1);
            this.moves = [...pastMoves, [piece, from, to, capture, this.board]];
            this.turn += 1;

            return true;
        } else {
            alert(capture);
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
         * If the move is legal, an Array containing:
         *   - the resulting board state,
         *   - the captured piece, if any, otherwise a space ' '.
         *
         * If the move is illegal, return an Array containing:
         *   - null,
         *   - a string message detailed why the move was rejected.
         */
        const piece = this.get(from);
        const side = WHITES.includes(piece);
        const [v, h] = to.diff(from);
        const av = Math.abs(v);
        const ah = Math.abs(h);

        let path = [];
        let result = this.copyBoard();
        let target = this.get(to);
        let capture = (target != ' ' && WHITES.includes(target) != side);
        const check = this.copyBoard();

        if (target != ' ' && side == WHITES.includes(target)) {
            return [null, `Illegal move!  Square ${to.label} is occupied by your own piece.`];
        }

        from.setCell(result, ' ');
        to.setCell(result, piece);

        if (KINGS.includes(piece)) {
            if (from.col == 4 && from.row == ((side) ? 7 : 0) && ah == 2 && v == 0) { 
                // Castling
                const rookRef = new Ref(to.row, (h > 0) ? 7 : 0);
                const rook = this.get(rookRef);
                if (rook != ROOKS[(side) ? 0 : 1]) {
                    return [null, `Illegal move!  Rook must be present for king to castle.`];
                }
                for (let i = 0; i < this.moves.length; i++) {
                    if (this.moves[i][1].equals(from) || rookRef.getCell(this.moves[i][4]) != rook) {
                        return [null, `Illegal move!  Castling is not allowed if the king or rook has previously moved.`];
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
                    return [null, `Illegal move!  This castling would move the king through check from ${threat.getCell(check)} at ${threat.label}.`];
                }

                rookRef.setCell(result, ' ');
                rookTo.setCell(result, rook);
            } else {
                if (av > 1 || ah > 1) {
                    return [null, `Illegal move!  King may move one square in any direction, or two squares when castling.`];
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
                return [null, `Illegal move!  Rook may only move either horizontally or vertically.`];
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
                return [null, `Illegal move!  Bishop may only move diagonally.`];
            }
        }
        if (QUEENS.includes(piece)) {
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
                return [null, `Illegal move!  Queen may only move horizontally, vertically or diagonally.`];
            }
        }
        if (KNIGHTS.includes(piece)) {
            if (!(av == 2 && ah == 1) && !(av == 1 && ah == 2)) {
                return [null, `Illegal move!  Invalid target for knight.`];
            }
        }
        if (PAWNS.includes(piece)) {
            const step = (side) ? -1 : 1;

            if (h == 0 && v == step) {
                // Single move forward.
                if (capture) {
                    return [null, `Illegal move!  Pawn may only capture on the diagonal.`];
                }
            } else if (h == 0 && v == (step * 2)) {
                // Double move forward.
                if (from.row != ((side) ? 6 : 1)) {
                    return [null, `Illegal move!  Pawn may not advance two squares, except as its initial move.`];
                }
                if (capture) {
                    return [null, `Illegal move!  Pawn may only capture on the diagonal.`];
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
                        target = result.get(lastMove[2]);
                        lastMove[2].setCell(result, ' ');
                    }
                }
                if (!capture) {
                    return [null, `Illegal move!  Pawn may only move diagonally to capture.`];
                }
            } else {
                // Some bullshit
                return [null, `Illegal move!  Pawn may only move forward, up to two spaces initially and one space otherwise, or diagonally to capture.`];
            }

            if (to.row == ((side) ? 0 : 7)) {
                to.setCell(result, PROMOTIONS[(side) ? 0 : 1][promotion]);
            }
        }
        if (path.length > 0) {
            // Check for obstructions
            for (let i = 0; i < path.length; i++) {
                if (!this.isEmpty(path[i])) {
                    return [null, `Illegal move!  Movement is blocked by another piece at ${path[i].label}.`];
                }
            }
        }
        // Does this move place the player's king in check?
        let threat = findCheck(result, side);
        if (threat) {
            return [null, `Illegal move!  This move would place the king in check from ${threat.getCell(result)} at ${threat.label}.`];
        }

        return [result, target];
    }

    getResult() {
        /*
         * Return the outcome of the game, as at the current board state.
         *
         * Returns:
         * - null: no result has been determined.
         * - 0: black player has won.
         * - 1: white player has won.
         * - 0.5: a draw.
         *
         * Note that this function only returns game results that can be
         * determined automatically; it does not account for player
         * resignations, agreed draws, or draws that must be claimed by a
         * player.
         *
         * In particular, this function will return a null (no result) unless
         * one of the following conditions are met:
         * - the player to move is in checkmate, in which case their opponent
         *   wins.
         * - the player to move is not in check, but has no legal move
         *   (stalemate), in which case the game is an automatic draw.
         * - the remaining pieces on the board cannot give rise to a checkmate,
         *   in which case the game is an automatic draw.
         */

        // TODO: Checkmate
        // TODO: Stalemate
        const pieces = getPieces(this.board).join('');
        if (DEAD_POSITIONS.includes(pieces)) {
            return 0.5;
        }
        if (pieces == "♔♗♚♝") {
            // Only a dead position if both bishops are on the same colour.
            const bishop1 = findPiece(this.board, WHITE_BISHOP);
            const bishop2 = findPiece(this.board, BLACK_BISHOP);
            if (bishop1.colour == bishop2.colour) {
                return 0.5;
            }
        }
        return null;
    }

    getMoveSAN(index) {
        /*
         * Return the move at 'index' in Standard Algebraic Notation.
         */
        let result = '';
        const [piece, from, to, capture, board] = this.moves[index];
        const side = ((index + 1) % 2);

        if (KINGS.includes(piece) && Math.abs(to.col - from.col) == 2) {
            // Special case for castling.
            if (to.col == 2) {
                return 'O-O-O';
            } else if (to.col == 6) {
                return 'O-O';
            } else {
                console.log("ERROR: something has gone terribly wrong; the king has moved two squares, but landed somewhere other than files 'c' or  'g'.");
            }
        }
        if (!PAWNS.includes(piece)) {
            result += SAN_PIECES[piece];
            // Could other pieces of the same type have moved here?
            if (index > 0) {
                const prev = this.copy();
                prev.selectTurn(index);
                const others = findPiece(prev.board, piece).filter(
                    x => !x.equals(from) && prev.validateMove(x, to)[0]
                );
                if (others.length) {
                    let file = true;
                    let rank = true;
                    for (let i = 0; i < others.length; i++) {
                        if (others[i].col == from.col) {
                            file = false;
                        }
                        if (others[i].row == from.row) {
                            rank = false;
                        }
                    }
                    if (file) {
                        result += from.file;
                    } else if (rank) {
                        result += from.rank;
                    } else {
                        result += from.label;
                    }
                }
            }
        }

        if (capture != ' ') {
            if (PAWNS.includes(piece)) {
                result += from.file;
            }
            result += 'x';
        }

        result += to.label;

        // Promotion?
        const finalPiece = to.getCell(board);
        if (piece != finalPiece) {
            result += '=' + SAN_PIECES[finalPiece];
        }

        // TODO: checking indicator
        return result;
    }

    exportPGN() {
        let result = '';
        for (const k in this.tags) {
            const v = writeTagValuePGN(this.tags[k]);
            result += `[${k} ${v}]` + '\n';
        }
        result += '\n';
        let length = 0;
        let token = '';
        for (let i = 0; i < this.moves.length; i++) {
            if (i % 2 == 0) {
                token += (Math.floor(i / 2) + 1) + '.';
            }
            token += this.getMoveSAN(i);
            if (length + token.length < 78) {
                result += ' ' + token;
                length += 1 + token.length;
            } else {
                result += '\n' + token;
                length = token.length;
            }
        }

        let end = '*';
        if (this.result == 0) {
            end = '0-1';
        } else if (this.result == 1) {
            end = '1-0';
        } else if (this.result > 0 && this.result < 1) {
            end = '1/2-1/2';
        }
        if (length + end.length < 78) {
            result += ' ' + end;
        } else {
            result += '\n' + end;
        }
        result += '\n'
        return result;
    }
}

export function copyBoard(board) {
    let copy = [];
    board.forEach(row => {
        copy.push(row.slice());
    });
    return copy;
}

export function findPiece(board, piece) {
    /*
     * Find all instances of a piece on the board.
     *
     * Returns an Array of Refs to all of the cells on the board that contain
     * the given piece, in left-to-right, top-to-bottom order.
     */
    const result = [];
    for (let r = 0; r < board.length; r++) {
        const row = board[r];
        for (let c = 0; c < row.length; c++) {
            if (row[c] == piece) {
                result.push(new Ref(r, c));
            }
        }
    }
    return result;
}

export function getPieces(board) {
    /*
     * Return all pieces remaining on the board.
     *
     * Returns:
     * An Array containing all of the pieces present on the given board, in
     * lexicographical order.
     *
     * For example, if white has its king and two knights, and black has its
     * king, a bishop and a pawn, this function will return:
     *     ["♔", "♘", "♘", "♚", "♝", "♟"]
     */
    const result = [];
    for (let r = 0; r < board.length; r++) {
        const row = board[r];
        for (let c = 0; c < row.length; c++) {
            if (row[c] != ' ') {
                result.push(row[c]);
            }
        }
    }
    return result.sort();
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
    const refs = findPiece(board, piece);
    if (refs.length == 0) {
        console.log(`Error: ${piece} not found when testing for check.`);
        return false;
    }
    const target = refs[0];

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

export function writeTagValuePGN(value) {
    /*
     * Return the given tag value for use in PGN.
     *
     * The given string is escaped and quoted according to PGN string token
     * rules, with the exception that Unicode characters are permitted (because
     * it's the year 2020, and refusing to encode non-ASCII characters is
     * ridiculous).  Non-printing characters and tabs from 'value' are omitted
     * from the result.
     */
    let result = '"';
    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (ch.charCodeAt(0) < 32) {
            continue;
        }
        if (ch == "\\" || ch == '"') {
            result += "\\";
        }
        result += ch;
    }
    return result + '"';
}
