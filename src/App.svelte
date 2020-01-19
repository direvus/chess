<script>
    import Grid from './Grid.svelte';
    import { Ref, WHITE_PAWN, BLACK_PAWN } from './chess.js';

    export let game;
    export let rotation;

    function doMove(fromCol, fromRow, toCol, toRow) {
        const from = new Ref(fromCol, fromRow);
        const to = new Ref(toCol, toRow);
        const move = game.move(from, to);
        game = game;
        return move;
    }

    function resetGame() {
        game.initialise();
        game = game;
    }

    function selectTurn(turn) {
        game.selectTurn(turn);
        game = game;
    }

    function goBack() {
        if (game.turn > 2) {
            selectTurn(game.turn - 2);
        }
    }

    function goForward() {
        if (game.turn < game.moves.length + 1) {
            selectTurn(game.turn);
        }
    }

    function rotateBoard() {
        rotation = !rotation;
    }
</script>

<main>
    <div class="ui grid">
        <div class="eleven wide column">
            <Grid board={game.board} side={game.turn % 2 != 0} {rotation} {doMove} />
        </div>
        <div class="five wide column">
            <div class="ui fluid vertical menu">
                <div class="item">
                    <div class="ui two buttons">
                        <div class="ui button" on:click={resetGame}><i class="plus icon"></i> New game</div>
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
                            <span class="text"><big>{move[0]}</big></span>
                        </div>
                        <div class="eight wide column">
                            {move[1].label} <i class="long arrow alternate right icon"></i> {move[2].label}
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
