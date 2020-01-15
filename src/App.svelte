<script>
    import Grid from './Grid.svelte';

    export let game;
    export let turn;
    export let moves;

    const white = "♖♗♘♕♔♙"
    const black = "♜♞♝♛♚♟"
    const pawn = "♙♟"
    const rook = "♖♜"
    const knight = "♘♞"
    const bishop = "♗♝"
    const queen = "♕♛"
    const king = "♔♚"

    function getColumnLabel(col) {
        return String.fromCharCode('a'.charCodeAt(0) + col - 1);
    }

    function getCellLabel(index) {
        const col = getIndexColumn(index);
        const row = getIndexRow(index);
        return getColumnLabel(col) + row
    }

    function getCellIndex(col, row) {
        return (8 * (row - 1)) + col - 1;
    }

    function getIndexColumn(index) {
        return (index % 8) + 1;
    }

    function getIndexRow(index) {
        return Math.floor(index / 8) + 1;
    }

    function setCell(col, row, value) {
        const index = getCellIndex(col, row);
        let old = game[index];
        game[index] = value;
        return old;
    }
    function getCell(col, row) {
        return game[getCellIndex(col, row)];
    }

    function doMove(from, to) {
        if (isLegal(from, to)) {
            let piece = game[from];
            let target = game[to];
            game[from] = ' ';
            game[to] = piece;
            moves = [...moves, [from, to]];
            turn += 1;

            // TODO: en passant
            // TODO: promotion
            // TODO: castling
            return true;
        } else {
            return false;
        }
    }

    function isLegal(from, to) {
        const piece = game[from];
        const target = game[to];
        const label = getCellLabel(to);
        let path = [];
        if (target != ' ' && white.includes(piece) == white.includes(target)) {
            alert(`Illegal move!  Square ${label} is occupied by your own piece.`);
            return false;
        }
        if (king.includes(piece)) {
            // TODO: castling if king moves two squares
            const moves = [7, 8, 9, -1, 1, -9, -8, -7].map(x => from + x);
            if (!moves.includes(to)) {
                alert(`Illegal move!  Invalid target for king.`);
                return false;
            }
        }
        if (rook.includes(piece)) {
            const diff = to - from;

            if (Math.floor(from / 8) == Math.floor(to / 8)) {
                // Horizontal movement
                const step = (diff < 0) ? -1 : 1;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else if (diff % 8 == 0) {
                // Vertical movement
                const step = (diff < 0) ? -8 : 8;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Rook may only move either horizontally or vertically.`);
                return false;
            }
        }
        if (bishop.includes(piece)) {
            const diff = to - from;
            if (diff % 9 == 0) {
                const step = (diff < 0) ? -9 : 9;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else if (diff % 7 == 0) {
                const step = (diff < 0) ? -7 : 7;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Bishop may only move diagonally.`);
                return false;
            }
        }
        if (queen.includes(piece)) {
            const diff = to - from;

            if (Math.floor(from / 8) == Math.floor(to / 8)) {
                // Horizontal movement
                const step = (diff < 0) ? -1 : 1;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else if (diff % 8 == 0) {
                // Vertical movement
                const step = (diff < 0) ? -8 : 8;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else if (diff % 9 == 0) {
                // NE-SW diagonal movement
                const step = (diff < 0) ? -9 : 9;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else if (diff % 7 == 0) {
                // NW-SE diagonal movement
                const step = (diff < 0) ? -7 : 7;
                for (let i = from + step; i != to; i += step) {
                    path.push(i);
                }
            } else {
                // Some bullshit
                alert(`Illegal move!  Queen may only move horizontally, vertically or diagonally.`);
                return false;
            }
        }
        if (knight.includes(piece)) {
            const moves = [17, 10, -6, -15, -17, -10, 6, 15].map(x => from + x);
            if (!moves.includes(to)) {
                alert(`Illegal move!  Invalid target for knight.`);
                return false;
            }
        }
        if (pawn.includes(piece)) {
            const side = white.includes(piece);
            const direction = (side) ? 1 : -1;
            const capture = (game[to] != ' ' && white.includes(game[to]) != side);
            const fromRow = Math.floor(from / 8) + 1;
            const diagonals = [7, 9].map(x => from + (direction * x));

            // TODO: en passant
            // TODO: promotion

            if (to == from + (direction * 8)) {
                // Single move forward.
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return false;
                }
            } else if (to == from + (direction * 16)) {
                // Double move forward.
                if (fromRow != ((side) ? 2 : 7)) {
                    alert(`Illegal move!  Pawn may not advance two squares, except as its initial move.`);
                    return false;
                }
                if (capture) {
                    alert(`Illegal move!  Pawn may only capture on the diagonal.`);
                    return false;
                }
                path.push(from + (direction * 8));
            } else if (diagonals.includes(to)) {
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
                if (game[path[i]] != ' ') {
                    alert(`Illegal move!  Movement is blocked by another piece at ${getCellLabel(path[i])}.`);
                    return false;
                }
            }
        }
        // TODO: test for own king in check
        return true;
    }

</script>

<main>
    <Grid {game} {getCellIndex} {doMove} {getColumnLabel}/>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
