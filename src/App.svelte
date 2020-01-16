<script>
    import Grid from './Grid.svelte';
    import { Ref } from './chess.js';

    export let game;

    function doMove(fromCol, fromRow, toCol, toRow) {
        const from = new Ref(fromCol, fromRow);
        const to = new Ref(toCol, toRow);
        const move = game.move(from, to);
        game = game;
        return move;
    }
</script>

<main>
    <Grid board={game.board} {doMove} />
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
