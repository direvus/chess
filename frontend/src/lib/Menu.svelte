<script lang="ts">

    let {
        result,
        white,
        black,
        gameid,
        autorotate = $bindable(),
        resetGame,
        editGame,
        showImport,
        showNewGame,
        showJoin,
        showResign,
        showOfferDraw,
        exportGame,
        rotateBoard
    } = $props();
</script>

<div class="ui fixed inverted menu">
    <div class="ui container">
        <div class="header item">
            ♟ &emsp; Chess
        </div>
        <div class="ui simple dropdown item">
            <i class="cog icon"></i> Game
            <i class="dropdown icon"></i>
            <div class="menu">
                <div class="header">Offline</div>
                <div class="item {(gameid) ? 'disabled' : ''}" onclick={resetGame} role="button"><i class="star outline icon"></i> New game</div>
                <div class="item {(gameid) ? 'disabled' : ''}" onclick={editGame}><i class="pencil icon"></i> Edit game</div>
                <div class="item {(gameid) ? 'disabled' : ''}" onclick={showImport}><i class="upload icon"></i> Import from PGN</div>
                <div class="divider"></div>
                <div class="header">Online</div>
                <div class="item {(gameid || result != null) ? 'disabled' : ''}" onclick={showNewGame}><i class="user plus icon"></i> Invite player</div>
                <div class="item {(gameid) ? 'disabled' : ''}" onclick={showJoin}><i class="handshake icon"></i> Join game</div>
                <div class="item {(gameid) ? '' : 'disabled'}" onclick={showResign}><i class="flag outline icon"></i> Resign</div>
                <div class="item {(gameid) ? '' : 'disabled'}" onclick={showOfferDraw}><i class="balance scale icon"></i> Offer draw</div>
                <div class="divider"></div>
                <div class="header">Export</div>
                <div class="item" onclick={exportGame}><i class="download icon"></i> Export as PGN</div>
            </div>
        </div>
        <div class="ui simple dropdown item">
            <i class="eye icon"></i> View
            <i class="dropdown icon"></i>
            <div class="menu">
                <div class="item" onclick={rotateBoard}><i class="sync alternate icon"></i>Rotate board</div>
                <div class="divider"></div>
                <div class="item">
                    <div class="ui toggle checkbox">
                        <input type="checkbox" name="autorotate" bind:checked={autorotate}>
                        <label>Rotate automatically</label>
                    </div>
                </div>
            </div>
        </div>
        {#if white || black}
        <div class="item">
            {white || '?'}&nbsp;<em>v.</em>&nbsp;{black || '?'}
        </div>
        {/if}
    </div>
</div>

<style>
</style>
