<script>
    import Grid from './Grid.svelte';
    import Message from './Message.svelte';
    import {Ref, WHITE_PAWN, BLACK_PAWN, readPGN} from './chess.js';

    export let game;

    let rows = [0, 1, 2, 3, 4, 5, 6, 7];
    let cols = [0, 1, 2, 3, 4, 5, 6, 7];
    let rotation = false;
    let autorotate = false;
    let exportPGN = '';
    let importText = '';
    let message = {
        "level": "info",
        "icon": "info circle",
        "header": '',
        "message": ''
    };

    function showMessage(text, header='') {
        message = {
            "level": "info",
            "icon": "info circle",
            "header": header,
            "message": text
        };
        window.$('#message_modal').modal('show');
    }

    function showWarning(text, header='') {
        message = {
            "level": "warning",
            "icon": "exclamation triangle",
            "header": header,
            "message": text
        };
        window.$('#message_modal').modal('show');
    }

    function showError(text, header='') {
        message = {
            "level": "error",
            "icon": "times circle",
            "header": header,
            "message": text
        };
        window.$('#message_modal').modal('show');
    }

    function doMove(fromCol, fromRow, toCol, toRow) {
        const from = new Ref(fromCol, fromRow);
        const to = new Ref(toCol, toRow);
        try {
            const move = game.move(from, to);
            game = game;
            updateRotation();
            return move;
        } catch(error) {
            showError(error, "Illegal move");
        }
    }

    function resetGame() {
        game.initialise();
        game = game;
        updateRotation();
    }

    function editGame() {
        window.$('#edit_modal').modal('show');
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

    function showImport() {
        window.$('#import_modal').modal('show');
    }

    function hideImport() {
        window.$('#import_modal').modal('hide');
    }

    function exportGame() {
        exportPGN = game.exportPGN();
        window.$('#export_modal').modal('show');
    }

    function hideExport() {
        window.$('#export_modal').modal('hide');
    }

    function hideMessage() {
        window.$('#message_modal').modal('hide');
    }

    function hideEdit() {
        window.$('#edit_modal').modal('hide');
    }

    function importGame() {
        let result = readPGN(importText);
        if (result) {
            game = result;
        }
        window.$('#import_modal').modal('hide');
    }
</script>

<main>
    <div class="ui modal" id="import_modal">
        <i class="close icon"></i>
        <div class="header">Game import</div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <label>Enter a game in <a href="https://www.chessclub.com/help/PGN-spec">Portable Game Notation (PGN)</a></label>
                    <textarea bind:value={importText} rows="12"></textarea>
                </div>
            </div>
        </div>
        <div class="actions">
            <div class="ui positive button" on:click={importGame}>Import</div>
            <div class="ui button" on:click={hideImport}>Dismiss</div>
        </div>
    </div>

    <div class="ui modal" id="export_modal">
        <i class="close icon"></i>
        <div class="header">Game export</div>
        <pre><code>{exportPGN}</code></pre>
        <div class="actions">
            <div class="ui primary button" on:click={hideExport}>Dismiss</div>
        </div>
    </div>

    <div class="ui modal" id="message_modal">
        <i class="close icon"></i>
        <Message {...message}/>
        <div class="actions">
            <div class="ui primary button" on:click={hideMessage}>Dismiss</div>
        </div>
    </div>

    <div class="ui modal" id="edit_modal">
        <i class="close icon"></i>
        <div class="header">
            Edit game details
        </div>
        <div class="content">
            <div class="ui form">
                <h4 class="ui dividing header">Game details</h4>
                <div class="four fields">
                    <div class="field">
                        <label>Event name</label>
                        <input type="text" placeholder="Event name" bind:value={game.tags["Event"]}>
                    </div>
                    <div class="field">
                        <label>Event location</label>
                        <input type="text" placeholder="Event location" bind:value={game.tags["Site"]}>
                    </div>
                    <div class="field">
                        <label>Date</label>
                        <input type="text" placeholder="YYYY.MM.DD" bind:value={game.tags["Date"]}>
                    </div>
                    <div class="field">
                        <label>Round</label>
                        <input type="text" placeholder="Round" bind:value={game.tags["Round"]}>
                    </div>
                </div>
                <h4 class="ui dividing header">Players</h4>
                <div class="two fields">
                    <div class="field">
                        <label>White player</label>
                        <input type="text" placeholder="Lastname, firstname" bind:value={game.tags["White"]}>
                    </div>
                    <div class="field">
                        <label>Black player</label>
                        <input type="text" placeholder="Lastname, firstname" bind:value={game.tags["Black"]}>
                    </div>
                </div>
                <h4 class="ui dividing header">Game result</h4>
                <div class="inline four fields">
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input type="radio" name="result" bind:group={game.tags["Result"]} value="*">
                            <label>Incomplete</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input type="radio" name="result" bind:group={game.tags["Result"]} value="1-0">
                            <label>White wins</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input type="radio" name="result" bind:group={game.tags["Result"]} value="0-1">
                            <label>Black wins</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input type="radio" name="result" bind:group={game.tags["Result"]} value="1/2-1/2">
                            <label>Draw</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <div class="ui primary button" on:click={hideEdit}>Close</div>
        </div>
    </div>

    <div class="ui container">
        <h1 class="ui header">
            {("Event" in game.tags && game.tags["Event"]) ? game.tags["Event"] : "Unnamed game"}
        </h1>
        <h2 class="ui header">
            {("White" in game.tags && game.tags["White"] && "Black" in game.tags && game.tags["Black"]) ? game.tags["White"] + " vs. " + game.tags["Black"] : ''}<br/>
            {("Date" in game.tags && game.tags["Date"]) ? game.tags["Date"] : ''}
        </h2>
    </div>

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
                        <div class="ui button" on:click={editGame}><i class="pencil icon"></i> Edit game</div>
                    </div>
                </div>
                <div class="item">
                    <div class="ui two buttons">
                        <div class="ui button" on:click={showImport}><i class="upload icon"></i> Import PGN</div>
                        <div class="ui button" on:click={exportGame}><i class="download icon"></i> Export PGN</div>
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
                        <div
                            class="step">Turn&emsp;<strong>{Math.ceil(game.turn / 2)}</strong></div>
                        <div class="active step">
                            {#if game.result == 0}
                            Game over&emsp;<strong>Black wins</strong>
                            {:else if game.result == 1}
                            Game over&emsp<strong>White wins</strong>
                            {:else if game.result == 0.5}
                            Game over&emsp<strong>Draw</strong>
                            {:else}
                            To play&emsp;<strong>{(game.turn % 2) ? 'White' : 'Black'}</strong>
                            {/if}
                        </div>
                    </div>
                </div>

                {#each game.moves as move, i}
                <a href="#self" class="item {(game.turn == (i + 2)) ? 'active blue' : ''}" on:click={() => selectTurn(i + 1)}>
                    <div class="ui grid">
                        <div class="two wide column">
                            {#if i % 2 == 0}
                            <span>{Math.floor(i / 2) + 1}.</span>
                            {/if}
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
