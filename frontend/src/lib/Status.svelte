<script>
    import {WHITE_PAWN, BLACK_PAWN} from './chess.js';
    export let result;
    export let turn;
    export let moves;
    export let side;
    export let gameid;
    export let goBack;
    export let goForward;
    export let selectTurn;
</script>

<div class="ui fluid vertical menu">
    <div class="item">
        {#if result == null}
        <div class="ui fluid steps">
            <div class="step">Turn&emsp;<strong>{Math.ceil(turn / 2)}</strong></div>
            <div class="active step">To play&emsp;<strong>{(turn % 2) ? 'White' : 'Black'}</strong></div>
        </div>
        <div class="ui two huge buttons">
            <div class="ui {(turn % 2 == 1) ? 'active' : 'disabled'} button" title="White"><big>{WHITE_PAWN}</big></div>
            <div class="ui {(turn % 2 == 0) ? 'active' : 'disabled'} button" title="Black"><big>{BLACK_PAWN}</big></div>
        </div>
        {:else}
        <div class="ui inverted {(result != 0.5 && side != null) ? ((result == side) ? 'green' : 'red') : ''} center aligned segment">
            Game over&emsp;
            {#if result == 0.5}
            <i class="balance scale icon"></i> <strong>Draw</strong>
            {:else}
                {#if side != null}
                    {#if result == side}
                    <i class="trophy icon"></i>
                    {:else}
                    <i class="flag outline icon"></i>
                    {/if}
                {/if}
                <strong>{(result == 1) ? 'White' : 'Black'} wins</strong>
            {/if}
        </div>
        {/if}
    </div>
    {#if gameid == null}
    <div class="item">
        <div class="ui two buttons">
            <button class="ui {(turn < 2) ? 'disabled' : ''} button" on:click={goBack}><i class="step backward icon"></i> Back</button>
            <button class="ui {(turn == moves.length + 1) ? 'disabled' : ''} button" on:click={goForward}><i class="step forward icon"></i> Forward</button>
        </div>
    </div>
    {/if}

    {#each moves as move, i}
    <a href="#self" class="item {(turn == (i + 2)) ? 'active blue' : ''}" on:click={() => selectTurn(i + 1)}>
        <div class="ui grid">
            <div class="two wide column">
                {#if i % 2 == 0}
                <span>{Math.floor(i / 2) + 1}.</span>
                {/if}
            </div>
            <div class="two wide column">
                <span class="text center"><big>{move.piece}</big></span>
            </div>
            <div class="eight wide column">
                {move.from.label} <i class="long arrow alternate right icon"></i> {move.to.label}
            </div>
            <div class="four wide column">
                {#if move.capture && move.capture != ' '}
                <span class="text center"><i class="times icon"></i><big>{move.capture}</big></span>
                {/if}
            </div>
        </div>
    </a>
    {/each}
</div>

<style>
</style>
