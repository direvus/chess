<script>
    import Grid from './Grid.svelte';

    export let game;
    export let turn;
    export let moves;

    function getColumnLabel(col) {
        return String.fromCharCode('a'.charCodeAt(0) + col - 1);
    }

    function getCellIndex(col, row) {
        return (8 * (row - 1)) + col - 1;
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
            alert("Illegal move!");
            return false;
        }
    }

    function isLegal(from, to) {
        // TODO: legality
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
