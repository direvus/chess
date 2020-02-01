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

export const ORTHOGONALS = QUEENS + ROOKS;
export const DIAGONALS = QUEENS + BISHOPS;

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
export const STR_TAGS = [
    "Event",
    "Site",
    "Date",
    "Round",
    "White",
    "Black",
    "Result"];

export const DEAD_POSITIONS = [
    "♔♚",
    "♔♗♚",
    "♔♚♝",
    "♔♘♚",
    "♔♚♞"];
export const INITIAL_BOARD = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']];

export const KNIGHT_VECTORS = [
    [ 1,  2],
    [ 2,  1],
    [ 2, -1],
    [ 1, -2],
    [-1, -2],
    [-2, -1],
    [-2,  1],
    [-1,  2]];
export const KING_VECTORS = [
    [ 1,  1],
    [ 1,  0],
    [ 1, -1],
    [ 0, -1],
    [-1, -1],
    [-1,  0],
    [-1,  1],
    [ 0,  1],
    [ 0,  2],
    [ 0, -2]];

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

    isEmpty(board) {
        return (this.getCell(board) == ' ');
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
        if (this.row < ref.row) {
            return -1;
        } else if (this.row > ref.row) {
            return 1;
        }
        if (this.col < ref.col) {
            return -1;
        } else if (this.col > ref.col) {
            return 1;
        }
        return 0;
    }
}

export class Move {
    constructor(piece, from, to, capture, board, nag=0) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.capture = capture;
        this.board = board;
        this.nag = nag;
    }
    copy() {
        return new Move(this.piece, this.from, this.to, this.capture, this.board, this.nag);
    }
    diff() {
        return this.from.diff(this.to);
    }
}

export class Game {
    constructor() {
        this.initialise();
    }

    initialise() {
        this.board = copyBoard(INITIAL_BOARD);
        this.moves = [];
        this.tags = {
            "Event": '',
            "Site": '',
            "Date": '',
            "Round": '',
            "White": '',
            "Black": '',
            "Result": '*'
        };
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
        if (ref.row >= 0 && ref.row < this.board.length) {
            const row = this.board[ref.row];
            if (ref.col >= 0 && ref.col < row.length) {
                return row[ref.col];
            }
        }
        return null;
    }

    set(ref, value) {
        if (ref.row >= 0 && ref.row < this.board.length) {
            const row = this.board[ref.row];
            if (ref.col >= 0 && ref.col < row.length) {
                const piece = row[ref.col];
                row[ref.col] = value;
                return piece;
            }
        }
        return null;
    }

    isEmpty(ref) {
        const piece = this.get(ref);
        if (piece) {
            return (piece == ' ');
        }
        return null;
    }

    copyBoard() {
        return copyBoard(this.board);
    }

    copyMoves() {
        let result = [];
        this.moves.forEach(move => {
            result.push(move.copy());
        });
        return result;
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
        if (turn >= 0 && index < this.moves.length && next != this.turn) {
            this.turn = next;
            if (turn > 0) {
                this.board = copyBoard(this.moves[index].board);
            } else {
                this.board = copyBoard(INITIAL_BOARD);
            }
            this.result = this.getResult();
        }
    }

    move(from, to, promotion=0) {
        /*
         * Execute a move in this game, if it is legal.
         *
         * We call validateMove() to do all the heavy lifting of finding out
         * whether the move is legal, and determining the new board state that
         * results from the move.
         *
         * If successful, we update the board, increment the turn counter, and
         * append the details of the move and new board state to the move
         * listing.
         *
         * Otherwise, we throw the error message as an exception.
         *
         * Arguments:
         * from: a Ref to the departing square
         * to: a Ref to the arrival square
         * promotion: 0=queen, 1=knight, 2=rook, 3=bishop
         *
         * Returns:
         * True if the move succeeded, or throw an error message.
         */
        let [newBoard, capture] = validateMove(this.board, this.moves, from, to, promotion);
        if (newBoard) {
            const piece = this.get(from);
            this.board = newBoard;
            /*
             * In case we've backtracked, erase future moves before recording
             * the new one.
             */
            const pastMoves = this.moves.slice(0, this.turn - 1);
            const move = new Move(piece, from, to, capture, this.copyBoard(), 0);
            this.moves = [...pastMoves, move];
            this.turn += 1;
            this.result = this.getResult();

            return true;
        } else {
            throw capture;
        }
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
        const side = (this.turn % 2 != 0);
        const moves = this.moves.slice(0, this.turn);
        if (inCheckmate(this.board, side, moves)) {
            return (side) ? 0 : 1;
        }
        if (inStalemate(this.board, side, moves)) {
            return 0.5;
        }
        const pieces = getPieces(this.board).join('');
        if (DEAD_POSITIONS.includes(pieces)) {
            return 0.5;
        }
        if (pieces == "♔♗♚♝") {
            // Only a dead position if both bishops are on the same colour.
            const bishop1 = findPieces(this.board, WHITE_BISHOP);
            const bishop2 = findPieces(this.board, BLACK_BISHOP);
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
        const move = this.moves[index];
        const side = ((index + 1) % 2 != 0);

        if (KINGS.includes(move.piece) && Math.abs(move.to.col - move.from.col) == 2) {
            // Special case for castling.
            if (move.to.col == 2) {
                return 'O-O-O';
            } else if (move.to.col == 6) {
                return 'O-O';
            } else {
                console.log("ERROR: something has gone terribly wrong; the king has moved two squares, but landed somewhere other than files 'c' or  'g'.");
            }
        }
        if (!PAWNS.includes(move.piece)) {
            result += SAN_PIECES[move.piece];
            // Could other pieces of the same type have moved here?
            if (index > 0) {
                const prev = this.copy();
                prev.selectTurn(index);
                const others = findPieces(prev.board, move.piece).filter(
                    x => !x.equals(move.from) && validateMove(prev.board, prev.moves, x, move.to)[0]
                );
                if (others.length) {
                    let file = true;
                    let rank = true;
                    for (let i = 0; i < others.length; i++) {
                        if (others[i].col == move.from.col) {
                            file = false;
                        }
                        if (others[i].row == move.from.row) {
                            rank = false;
                        }
                    }
                    if (file) {
                        result += move.from.file;
                    } else if (rank) {
                        result += move.from.rank;
                    } else {
                        result += move.from.label;
                    }
                }
            }
        }

        if (move.capture != ' ') {
            if (PAWNS.includes(move.piece)) {
                result += move.from.file;
            }
            result += 'x';
        }

        result += move.to.label;

        // Promotion?
        const finalPiece = move.to.getCell(move.board);
        if (move.piece != finalPiece) {
            result += '=' + SAN_PIECES[finalPiece];
        }

        // Checking indicator
        if (findCheck(move.board, !side)) {
            let marker = '+';
            if (inCheckmate(move.board, !side, this.moves.slice(0, index + 1))) {
                marker = '#';
            }
            result += marker;
        }

        if (move.nag > 0) {
            result += ' $' + move.nag;
        }
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
                token += (Math.floor(i / 2) + 1) + '. ';
            }
            token += this.getMoveSAN(i);
            if (length + token.length < 78) {
                result += ' ' + token;
                length += 1 + token.length;
            } else {
                result += '\n' + token;
                length = token.length;
            }
            token = '';
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

    getNonSTRTags() {
        const result = {};
        for (const k in this.tags) {
            if (!STR_TAGS.includes(k)) {
                result[k] = this.tags[k];
            }
        }
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

export function findPieces(board, pieces) {
    /*
     * Find all instances of the given pieces on the board.
     *
     * Returns an Array of Refs to all of the cells on the board that contain
     * any of the pieces listed in 'pieces', in left-to-right, top-to-bottom
     * board order.
     */
    const result = [];
    for (let r = 0; r < board.length; r++) {
        const row = board[r];
        for (let c = 0; c < row.length; c++) {
            if (pieces.includes(row[c])) {
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

export function getSide(piece) {
    /*
     * Return the side of the given piece.
     *
     * Arguments:
     * piece: a single-character string containing the piece.
     *
     * Returns:
     * - true if the piece is white,
     * - false if the piece is black,
     * - null if the piece is neither.
     */
    if (WHITES.includes(piece)) {
        return true;
    } else if (BLACKS.includes(piece)) {
        return false;
    }
    return null;
}

export function onSide(piece, side) {
    /*
     * Return whether the given piece is on the given side.
     *
     * Arguments:
     * piece: a single-character string containing the piece.
     * side: a boolean value (true = white, false = black).
     *
     * Returns:
     * True if the piece is on the given side, false otherwise.
     */
    return (getSide(piece) === side);
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
    const refs = findPieces(board, piece);
    if (refs.length == 0) {
        console.log(`Error: ${piece} not found when testing for check.`);
        return false;
    }
    const target = refs[0];

    // Knights
    for (let i = 0; i < KNIGHT_VECTORS.length; i++) {
        const v = KNIGHT_VECTORS[i]
        const ref = target.add(v[0], v[1]);
        const piece = ref.getCell(board);
        if (KNIGHTS.includes(piece) && WHITES.includes(piece) != side) {
            return ref;
        }
    }

    // Pawns
    let vectors = [
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
    let orthogonals, diagonals;
    if (side) {
        orthogonals = BLACK_QUEEN + BLACK_ROOK;
        diagonals = BLACK_QUEEN + BLACK_BISHOP;
    } else {
        orthogonals = WHITE_QUEEN + WHITE_ROOK;
        diagonals = WHITE_QUEEN + WHITE_BISHOP;
    }
    for (let i = 0, step = 1; i < 2; i++) {
        // Vertical
        for (let r = target.row + step; r >= 0 && r < len; r += step) {
            const ref = new Ref(r, target.col);
            const piece = ref.getCell(board);
            if (piece == ' ') {
                continue;
            }
            if (orthogonals.includes(piece)) {
                return ref;
            } else {
                break;
            }
        }
        // Horizontal
        for (let c = target.col + step; c >= 0 && c < row.length; c += step) {
            const ref = new Ref(target.row, c);
            const piece = ref.getCell(board);
            if (piece == ' ') {
                continue;
            }
            if (orthogonals.includes(piece)) {
                return ref;
            } else {
                break;
            }
        }
        // Diagonal
        let h = step;
        let v = step;
        for (let j = 0; j < 2; j++) {
            let ref = target.add(v, h);
            let piece = ref.getCell(board);
            while (piece) {
                if (piece != ' ') {
                    if (diagonals.includes(piece)) {
                        return ref;
                    } else {
                        break;
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

export function getMoves(board, from) {
    /*
     * Return the set of all possible moves for the given piece.
     *
     * The move set is not tested for legality, it is simply the set of all
     * locations the piece could theoretically move to, given its movement
     * type.
     *
     * Collisions are taken into account, but more complex movement
     * restrictions are not.  To discover whether a move is actually legal you
     * must use validateMove().
     *
     * Arguments:
     * board: a game board state
     * from: a Ref to the square the piece is departing from
     *
     * Returns:
     * An Array of Refs to possible destination squares.
     */
    const result = [];
    const piece = from.getCell(board);
    const side = getSide(piece);
    let vectors = null;

    if (KINGS.includes(piece)) {
        vectors = KING_VECTORS;
    } else if (KNIGHTS.includes(piece)) {
        vectors = KNIGHT_VECTORS;
    } else if (PAWNS.includes(piece)) {
        vectors = [
            [1,  0],
            [2,  0],
            [1,  1],
            [1, -1]];
        if (side) {
            vectors = vectors.map(([r, c]) => [-r, c]);
        }
    }
    if (vectors) {
        const refs = vectors.map(([r, c]) => from.add(r, c));
        refs.forEach(x => {
            const target = x.getCell(board);
            if (target != null && !onSide(target, side)) {
                result.push(x);
            }
        });
        return result;
    }

    const len = board.length;
    const row = board[from.row];
    if (ORTHOGONALS.includes(piece)) {
        for (let i = 0, step = 1; i < 2; i++) {
            // Vertical
            for (let r = from.row + step; r >= 0 && r < len; r += step) {
                const ref = new Ref(r, from.col);
                const target = ref.getCell(board);
                if (onSide(target, side)) {
                    break;
                }
                result.push(ref);
                if (target != null) {
                    break;
                }
            }
            // Horizontal
            for (let c = from.col + step; c >= 0 && c < row.length; c += step) {
                const ref = new Ref(from.row, c);
                const target = ref.getCell(board);
                if (onSide(target, side)) {
                    break;
                }
                result.push(ref);
                if (target != null) {
                    break;
                }
            }
        }
    }
    if (DIAGONALS.includes(piece)) {
        for (let i = 0, step = 1; i < 2; i++) {
            let h = step;
            let v = step;
            for (let j = 0; j < 2; j++) {
                let ref = from.add(v, h);
                let target = ref.getCell(board);
                while (target) {
                    if (onSide(target, side)) {
                        break;
                    }
                    result.push(ref);
                    if (target != ' ') {
                        break;
                    }
                    ref = ref.add(v, h);
                    target = ref.getCell(board);
                }
                v = -step;
            }
            step = -step;
        }
    }
    return result;
}

export function validateMove(board, moves, from, to, promotion=0) {
    /*
     * Assess whether the given move is legal.
     *
     * Arguments:
     * board: the board state prior to the move
     * moves: all prior moves in the game
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
    const piece = from.getCell(board);
    const side = getSide(piece);
    const [v, h] = to.diff(from);
    const av = Math.abs(v);
    const ah = Math.abs(h);
    const result = copyBoard(board);
    const check = copyBoard(board);

    let path = [];
    let target = to.getCell(board);
    let capture = (target != ' ' && WHITES.includes(target) != side);

    if (target == null) {
        return [null, `Destination square is not valid.`];
    }
    if (target != ' ' && side == WHITES.includes(target)) {
        return [null, `Square ${to.label} is occupied by your own piece.`];
    }

    from.setCell(result, ' ');
    to.setCell(result, piece);

    if (KINGS.includes(piece)) {
        if (from.col == 4 && from.row == ((side) ? 7 : 0) && ah == 2 && v == 0) {
            // Castling
            const rookRef = new Ref(to.row, (h > 0) ? 7 : 0);
            const rook = rookRef.getCell(board);
            if (rook != ROOKS[(side) ? 0 : 1]) {
                return [null, `Rook must be present for king to castle.`];
            }
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].to.equals(from) || rookRef.getCell(moves[i].board) != rook) {
                    return [null, `Castling is not allowed if the king or rook has previously moved.`];
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
                return [null, `This castling would move the king through check from ${threat.getCell(check)} at ${threat.label}.`];
            }

            rookRef.setCell(result, ' ');
            rookTo.setCell(result, rook);
        } else {
            if (av > 1 || ah > 1) {
                return [null, `King may move one square in any direction, or two squares when castling.`];
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
            return [null, `Rook may only move either horizontally or vertically.`];
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
            return [null, `Bishop may only move diagonally.`];
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
            return [null, `Queen may only move horizontally, vertically or diagonally.`];
        }
    }
    if (KNIGHTS.includes(piece)) {
        if (!(av == 2 && ah == 1) && !(av == 1 && ah == 2)) {
            return [null, `Invalid target for knight.`];
        }
    }
    if (PAWNS.includes(piece)) {
        const step = (side) ? -1 : 1;

        if (h == 0 && v == step) {
            // Single move forward.
            if (capture) {
                return [null, `Pawn may only capture on the diagonal.`];
            }
        } else if (h == 0 && v == (step * 2)) {
            // Double move forward.
            if (from.row != ((side) ? 6 : 1)) {
                return [null, `Pawn may not advance two squares, except as its initial move.`];
            }
            if (capture) {
                return [null, `Pawn may only capture on the diagonal.`];
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
            if (moves.length > 0) {
                const lastMove = moves[moves.length - 1];
                const [lastV, lastH] = lastMove.diff();
                if (to.col == lastMove.to.col &&
                        to.row == (lastMove.to.row + step) &&
                        PAWNS.includes(lastMove.piece) &&
                        lastH == 0 && Math.abs(lastV) == 2) {
                    capture = true;
                    target = lastMove.to.getCell(result);
                    lastMove.to.setCell(result, ' ');
                }
            }
            if (!capture) {
                return [null, `Pawn may only move diagonally to capture.`];
            }
        } else {
            // Some bullshit
            return [null, `Pawn may only move forward, up to two spaces initially and one space otherwise, or diagonally to capture.`];
        }

        if (to.row == ((side) ? 0 : 7)) {
            to.setCell(result, PROMOTIONS[(side) ? 0 : 1][promotion]);
        }
    }
    if (path.length > 0) {
        // Check for obstructions
        for (let i = 0; i < path.length; i++) {
            const blocker = path[i].getCell(board);
            if (blocker != ' ') {
                return [null, `Movement is blocked by ${blocker} at ${path[i].label}.`];
            }
        }
    }
    // Does this move place the player's king in check?
    let threat = findCheck(result, side);
    if (threat) {
        return [null, `This move would place the king in check from ${threat.getCell(result)} at ${threat.label}.`];
    }

    return [result, target];
}

export function inCheckmate(board, side, moves) {
    /*
     * Return whether a side is in checkmate.
     *
     * If the side's king is currently in check, and there is no legal move
     * which would end in the king being out of check, then the king is in
     * checkmate and the side's player has lost the game.
     *
     * Arguments:
     * board: a board state
     * side: the side to examine for checkmate (true = white, false = black)
     * moves: an Array of moves played thus far in the game
     *
     * Returns:
     * True if checkmate is confirmed, false otherwise.
     */
    const origin = findCheck(board, side);
    if (!origin) {
        return false;
    }
    const attacker = origin.getCell(board);
    const king = (side) ? WHITE_KING : BLACK_KING;
    const target = findPieces(board, king)[0];
    if (!target) {
        throw "No king found?!";
    }
    /*
     * First, find whether the king is able to move out of check.
     */
    let escapes = KING_VECTORS.map(x => target.add(x[0], x[1]));
    for (let i = 0; i < escapes.length; i++) {
        if (validateMove(board, moves, target, escapes[i])[0]) {
            return false;
        }
    }

    /*
     * Okay, escaping didn't work, determine the path of the attacker.
     */
    const [v, h] = target.diff(origin);
    const av = Math.abs(v);
    const ah = Math.abs(h);
    const path = [origin];

    if (v == 0) {
        // Horizontal
        const step = (h > 0) ? 1 : -1;
        for (let i = step; i != h; i += step) {
            path.push(origin.add(0, i));
        }
    } else if (h == 0) {
        // Vertical
        const step = (v > 0) ? 1 : -1;
        for (let i = step; i != v; i += step) {
            path.push(origin.add(i, 0));
        }
    } else if (av == ah) {
        // Diagonal
        const vStep = (v > 0) ? 1 : -1;
        const hStep = (h > 0) ? 1 : -1;
        for (let i = vStep, j = hStep; i != v; i += vStep, j += hStep) {
            path.push(origin.add(i, j));
        }
    }

    /*
     * Is there an allied piece that can capture the attacker, or block its
     * path to the king?
     */
    const allies = (side) ?
        WHITE_QUEEN + WHITE_ROOK + WHITE_BISHOP + WHITE_KNIGHT + WHITE_PAWN :
        BLACK_QUEEN + BLACK_ROOK + BLACK_BISHOP + BLACK_KNIGHT + BLACK_PAWN;
    const refs = findPieces(board, allies);
    for (let i = 0; i < refs.length; i++) {
        for (let j = 0; j < path.length; j++) {
            if (validateMove(board, moves, refs[i], path[j])[0]) {
                return false;
            }
        }
        /*
         * If the attacking piece is a pawn, is it vulnerable to an en
         * passant capture?  This scenario is very unlikely, but we must make
         * sure.
         */
        const ally = refs[i].getCell(board);
        if (PAWNS.includes(ally) && PAWNS.includes(attacker)) {
            const last = moves[moves.length - 1];
            const [v, h] = last[2].diff(last[1]);
            if (last[2] == origin && Math.abs(v) == 2 && h == 0) {
                const single = last[1].add((v > 0) ? 1 : -1, 0);
                if (validateMove(board, moves, refs[i], single)[0]) {
                    return false;
                }
            }
        }
    }
    return true;
}

export function inStalemate(board, side, moves) {
    /*
     * Return whether a game is in stalemate.
     *
     * If the side to move is not in check, but there is no legal move
     * available to the player, a stalemate has been reached, and the game ends
     * in an automatic draw.
     *
     * Arguments:
     * board: a board state
     * side: the side to play next
     * moves: an Array of moves played thus far in the game
     *
     * Returns:
     * True if a stalemate is confirmed, false otherwise.
     */
    if (findCheck(board, side)) {
        return false;
    }
    const pieces = getPieces(board).filter(x => onSide(x, side));
    const refs = findPieces(board, pieces);
    for (let i = 0; i < refs.length; i++) {
        const dests = getMoves(board, refs[i]);
        for (let j = 0; j < dests.length; j++) {
            if (validateMove(board, moves, refs[i], dests[j])[0]) {
                return false;
            }
        }
    }
    return true;
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

export function readPGN(source) {
    /*
     * Read a game in Portable Game Notation (PGN) format.
     *
     * Return a new Game object, or null if the game fails to parse.
     */
    const game = new Game();
    const lines = source.split('\n').filter(x => x.length > 0);
    const tokens = [];
    const SYMBOL = /^[A-Za-z0-9][A-Za-z0-9_+#=:/!?-]*/;
    const INTEGER = /^\d+/;
    const TOKENS = {
        "STRING": 0,
        "INTEGER": 1,
        "MOVE_NUMBER": 2,
        "INCOMPLETE": 3,
        "OPEN_TAG": 4,
        "CLOSE_TAG": 5,
        "OPEN_RAV": 6,
        "CLOSE_RAV": 7,
        "NAG": 8,
        "SYMBOL": 9};
    const completions = {
        "0-1": 0,
        "1-0": 1,
        "1/2-1/2": 0.5,
        "*": null};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line[0] == '%') {
            continue;
        }
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            if (ch == ';') {
                // Comment; skip the rest of the line.
                break;
            }
            if (ch == '{') {
                // Comment; skip until next closing brace.
                const index = line.slice(j + 1).indexOf('}')
                j += index + 1;
            }

            if (ch == '[') {
                tokens.push([TOKENS.OPEN_TAG, ch]);
            } else if (ch == ']') {
                tokens.push([TOKENS.CLOSE_TAG, ch]);
            } else if (ch == '*') {
                tokens.push([TOKENS.INCOMPLETE, ch]);
            } else if (ch == '.') {
                tokens.push([TOKENS.MOVE_NUMBER, ch]);
            } else if (ch == '(') {
                tokens.push([TOKENS.OPEN_RAV, ch]);
            } else if (ch == ')') {
                tokens.push([TOKENS.CLOSE_RAV, ch]);
            }

            const s = line.slice(j);
            if (ch == '"') {
                // String; consume until the next unescaped quote.
                let escaped = false;
                let token = '';
                let k = 1;
                for (;;) {
                    if (k == s.length) {
                        return "Reached end of line while parsing string value.  Expected a string terminateion quote.";
                    }
                    if (escaped) {
                        token += s[k];
                        escaped = false;
                    }
                    if (s[k] == '"'){
                        break;
                    }
                    if (s[k] == '\\') {
                        escaped = true;
                    } else {
                        token += s[k];
                    }
                    k++;
                }
                j += k;
                tokens.push([TOKENS.STRING, token]);
            }
            if (ch == '$') {
                // Numeric Annotation Glyph (NAG); consume digits.
                let match = s.slice(1).match(INTEGER);
                tokens.push([TOKENS.NAG, match[0]]);
                j += match[0].length;
                continue;
            }
            let match = s.match(SYMBOL);
            if (match) {
                let type = TOKENS.SYMBOL;
                if (match[0].match(/^\d+$/)) {
                    type = TOKENS.INTEGER;
                }
                tokens.push([type, match[0]]);
                j += match[0].length - 1;
                continue;
            }

            // Some other crap, ignore ...
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        const [type, text] = tokens[i];
        if (type == TOKENS.OPEN_TAG) {
            // Expect to find a symbol, a string, and a close tag.
            const [name, value, close] = tokens.slice(i + 1, i + 4);
            if (name[0] != TOKENS.SYMBOL ||
                    value[0] != TOKENS.STRING ||
                    close[0] != TOKENS.CLOSE_TAG) {
                throw "Invalid tag definition: expected a symbol, followed by a string, followed by a closing square bracket."
            }
            game.tags[name[1]] = value[1];
            i += 3;
        } else if (type == TOKENS.INCOMPLETE) {
            game.result = null;
        } else if (type == TOKENS.NAG) {
            game.moves[game.moves.length - 1].nag = parseInt(text);
        } else if (type == TOKENS.SYMBOL) {
            if (Object.keys(completions).includes(text)) {
                game.result = completions[text];
            } else {
                const move = parseSAN(game.board, game.moves, text);
                if (move != null) {
                    game.moves.push(move);
                    game.board = move.board;
                    game.turn++;
                }
            }
        }
    }
    return game;
}

export function parseSAN(board, moves, text) {
    /*
     * Parse and validate a move in Standard Algebraic Notation (SAN).
     *
     * If the given move text follows SAN format, parse it and test that
     * the move is legal by passing it to validateMove().
     *
     * Arguments:
     * board: the board state prior to the current move
     * moves: the set of moves prior to the current move
     * text: the SAN text to parse
     *
     * Returns:
     * A Move object, or throw an error if the move failed to parse.
     */
    const side = (moves.length % 2);
    const ranks = "12345678";
    const files = "abcdefgh";
    const nags = {
        '!': 1,
        '?': 2,
        '!!': 3,
        '!?': 5,
        '?!': 6,
        '??': 4};
    let piece = PAWNS[side];
    let sourceRow = null;
    let sourceCol = null;
    let destRow = null;
    let destCol = null;
    let promotion = 0;
    let annotation = '';
    let nag = 0;
    let i = 0;

    if (text.startsWith("O-O")) {
        // King-side (short) castle
        piece = KINGS[side];
        destRow = (side == 0) ? 7 : 0;
        destCol = 6;
        i = 3;
    } else if (text == "O-O-O") {
        // Queen-side (long) castle
        piece = KINGS[side];
        destRow = (side == 0) ? 7 : 0;
        destCol = 2;
        i = 5;
    }
    for (; i < text.length; i++) {
        const ch = text[i];
        if (ch == 'K') {
            piece = KINGS[side];
        } else if (ch == 'Q') {
            piece = QUEENS[side];
        } else if (ch == 'R') {
            piece = ROOKS[side];
        } else if (ch == 'N') {
            piece = KNIGHTS[side];
        } else if (ch == 'B') {
            piece = BISHOPS[side];
        } else if (ch == 'P') {
            piece = PAWNS[side];
        } else if (files.includes(ch)) {
            const file = ch.charCodeAt(0) - "a".charCodeAt(0);
            if (destCol != null) {
                sourceCol = destCol;
                destCol = file;
            } else {
                destCol = file;
            }
        } else if (ranks.includes(ch)) {
            const rank = 8 - parseInt(ch);
            if (destRow != null) {
                sourceRow = destRow;
                destRow = rank;
            } else {
                destRow = rank;
            }
        } else if (ch == '=') {
            // Promotion
            const p = text[i + 1];
            if (p == 'Q' || QUEENS.includes(p)) {
                promotion = 0;
            } else if (p == 'N' || KNIGHTS.includes(p)) {
                promotion = 1;
            } else if (p == 'R' || ROOKS.includes(p)) {
                promotion = 2;
            } else if (p == 'B' || BISHOPS.includes(p)) {
                promotion = 3;
            }
        } else if (ch == '!' || ch == '?') {
            annotation += ch;
        }
    }
    if (destRow == null || destCol == null) {
        throw "Destination square not properly specified.";
    }
    let refs = findPieces(board, piece);
    if (sourceCol != null) {
        refs = refs.filter(x => x.col == sourceCol);
    }
    if (sourceRow != null) {
        refs = refs.filter(x => x.row == sourceRow);
    }
    const target = new Ref(destRow, destCol);
    const candidates = [];
    for (let i = 0; i < refs.length; i++) {
        if (validateMove(board, moves, refs[i], target, promotion)[0]) {
            candidates.push(refs[i]);
        }
    }
    if (candidates.length > 1) {
        throw `Multiple candidates for move "${text}".`;
    } else if (candidates.length == 0) {
        throw `No candidates found for move "${text}".`;
    }
    piece = candidates[0].getCell(board);
    const [newBoard, capture] = validateMove(board, moves, candidates[0], target);
    if (annotation.length > 0 && annotation in nags) {
        nag = nags[annotation];
    }
    return new Move(piece, candidates[0], target, capture, newBoard, nag);
}
