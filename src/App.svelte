<script>
    import Grid from './Grid.svelte';
    import { Ref, WHITE_PAWN, BLACK_PAWN } from './chess.js';

    export let game;

    let rows = [0, 1, 2, 3, 4, 5, 6, 7];
    let cols = [0, 1, 2, 3, 4, 5, 6, 7];
    let rotation = false;
    let autorotate = false;

    function doMove(fromCol, fromRow, toCol, toRow) {
        const from = new Ref(fromCol, fromRow);
        const to = new Ref(toCol, toRow);
        const move = game.move(from, to);
        game = game;
        updateRotation();
        return move;
    }

    function resetGame() {
        game.initialise();
        game = game;
        updateRotation();
    }

    function selectTurn(turn) {
        game.selectTurn(turn);
        game = game;
        updateRotation();
    }

    function goBack() {
        if (game.turn > 2) {
            selectTurn(game.turn - 2);
        }
        updateRotation();
    }

    function goForward() {
        if (game.turn < game.moves.length + 1) {
            selectTurn(game.turn);
        }
        updateRotation();
    }

    function rotateBoard() {
        rows = rows.reverse();
        cols = cols.reverse();
        rotation = !rotation;
    }

    function updateRotation() {
        if (!autorotate) {
            return;
        }

        rotation = !(game.turn % 2);
        if (rotation == (rows[0] == 0)) {
            rows = rows.reverse();
            cols = cols.reverse();
        }
    }
</script>

<main>
    <div class="ui grid">
        <div class="eleven wide column">
            <Grid
                board={game.board}
                side={game.turn % 2 != 0}
                {rows}
                {cols}
                {rotation}
                {rotateBoard}
                {doMove} />
        </div>
        <div class="five wide column">
            <div class="ui fluid vertical menu">
                <div class="item">
                    <div class="ui two buttons">
                        <div class="ui button" on:click={resetGame}><i class="plus icon"></i> New game</div>
                    </div>
                </div>
                <div class="item">
                    <div class="ui toggle checkbox">
                        <input type="checkbox" name="autorotate" bind:checked={autorotate}>
                        <label>Rotate automatically</label>
                    </div>
                </div>
                <div class="item">
                    <div class="ui two buttons">
                        <div class="ui button" on:click={goBack}><i class="step backward icon"></i> Back</div>
                        <div class="ui button" on:click={goForward}><i class="step forward icon"></i> Forward</div>
                    </div>
                </div>
                <div class="item">
                    <div class="ui two huge buttons">
                        <div class="ui {(game.turn % 2 == 1) ? 'primary' : ''} button" title="White"><big>{WHITE_PAWN}</big></div>
                        <div class="ui {(game.turn % 2 == 0) ? 'primary' : ''} button" title="Black"><big>{BLACK_PAWN}</big></div>
                    </div>
                    <div class="ui fluid steps">
                        <div class="step">Turn&emsp;<strong>{game.turn}</strong></div>
                        <div class="active step">To play&emsp;<strong>{(game.turn % 2) ? 'White' : 'Black'}</strong></div>
                    </div>
                </div>

                {#each game.moves as move, i}
                <a href="#self" class="item {(game.turn == (i + 2)) ? 'active blue' : ''}" on:click={() => selectTurn(i + 1)}>
                    <div class="ui grid">
                        <div class="two wide column">
                            <span class="ui label {(i % 2) ? 'black' : ''}">{i+1}</span>
                        </div>
                        <div class="two wide column">
                            <span class="text center"><big>{move[0]}</big></span>
                        </div>
                        <div class="six wide column">
                            {move[1].label} <i class="long arrow alternate right icon"></i> {move[2].label}
                        </div>
                        <div class="two wide column">
                            <span class="text center"><big>{move[3]}</big></span>
                        </div>
                    </div>
                </a>
                {/each}
            </div>
        </div>
    </div>
</main>

<style>
</style>
