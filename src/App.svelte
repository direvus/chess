<script>
    import Grid from './Grid.svelte';
    import { Ref, WHITE_PAWN, BLACK_PAWN } from './chess.js';

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
    <div class="ui grid">
        <div class="eleven wide column">
            <Grid board={game.board} {doMove} />
        </div>
        <div class="five wide column">
            <div class="ui fluid vertical menu">
                <div class="item">
                    <div class="ui two huge buttons">
                        <div class="ui {(game.turn % 2 == 1) ? 'primary' : ''} button" title="White">{WHITE_PAWN}</div>
                        <div class="ui {(game.turn % 2 == 0) ? 'primary' : ''} button" title="Black">{BLACK_PAWN}</div>
                    </div>
                    <div class="ui fluid steps">
                        <div class="step">Turn:&nbsp;<strong>{game.turn}</strong></div>
                        <div class="active step">To play:&nbsp;<strong>{(game.turn % 2) ? 'White' : 'Black'}</strong></div>
                    </div>
                </div>

                {#each game.moves as move, i}
                <div class="item">
                    <div class="ui grid">
                        <div class="two wide column">
                            <span class="ui label {(i % 2) ? 'black' : ''}">{i+1}</span>
                        </div>
                        <div class="two wide column">
                            <span class="text large">{move[0]}</span>
                        </div>
                        <div class="eight wide column">
                            {move[1].label} <i class="long arrow alternate right icon"></i> {move[2].label}
                        </div>
                    </div>
                </div>
                {/each}
            </div>
        </div>
    </div>
</main>

<style>
</style>
