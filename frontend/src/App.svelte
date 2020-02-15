<script>
    import Grid from './Grid.svelte';
    import Message from './Message.svelte';
    import {Ref, Move, WHITE_PAWN, WHITE_QUEEN, WHITE_KNIGHT, WHITE_ROOK,
        WHITE_BISHOP, BLACK_PAWN, BLACK_QUEEN, BLACK_KNIGHT, BLACK_ROOK,
        BLACK_BISHOP, readPGN} from './chess.js';

    export let game;

    const PROMOTIONS_WHITE = [
        WHITE_QUEEN,
        WHITE_KNIGHT,
        WHITE_ROOK,
        WHITE_BISHOP];
    const PROMOTIONS_BLACK = [
        BLACK_QUEEN,
        BLACK_KNIGHT,
        BLACK_ROOK,
        BLACK_BISHOP];

    let rows = [0, 1, 2, 3, 4, 5, 6, 7];
    let cols = [0, 1, 2, 3, 4, 5, 6, 7];
    let promotionWhite = 0;
    let promotionBlack = 0;
    let promoteWhiteCall = null;
    let promoteBlackCall = null;
    let rotation = false;
    let autorotate = false;
    let ws = null;
    let messageQueue = [];
    let gameid = null;
    let joincode = '';
    let gameHost = false;
    let hostWhite = true;
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

    function doMove(fromCol, fromRow, toCol, toRow, promotion=null) {
        const from = new Ref(fromCol, fromRow);
        const to = new Ref(toCol, toRow);
        const piece = game.get(from);
        if (promotion == null) {
            if (piece == WHITE_PAWN && toRow == 0) {
                promoteWhiteCall = () => {
                    window.$('#promote_modal_white').modal('hide');
                    doMove(fromCol, fromRow, toCol, toRow, promotionWhite);
                };
                window.$('#promote_modal_white').modal('show');
                return;
            } else if (piece == BLACK_PAWN && toRow == 7) {
                promoteBlackCall = () => {
                    window.$('#promote_modal_black').modal('hide');
                    doMove(fromCol, fromRow, toCol, toRow, promotionBlack);
                };
                window.$('#promote_modal_black').modal('show');
                return;
            }
        }
        try {
            const move = game.move(from, to, promotion);
            game = game;
            updateRotation();
            promoteWhiteCall = null;
            promoteBlackCall = null;
            if (gameid) {
                sendMessage({
                    action: "move",
                    id: gameid,
                    move: game.moves[game.moves.length - 1]
                });
            }
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

    function playerSide() {
        /*
         * Return the player's side.
         *
         * In an online game, return 1 if we are playing white, 0 if we 
         * are playing black.  This function is not applicable in offline
         * mode.
         */
        return (hostWhite == gameHost);
    }

    function isPlayerTurn() {
        /*
         * Return whether it is the player's turn.
         *
         * Always returns true for offline games.  For online games, return
         * true if it is the player's turn, false otherwise.
         */
        if (gameid == null) {
            return true;
        }
        return (playerSide() == (game.turn % 2));
    }

    function selectTurn(turn) {
        if (gameid) {
            showError("You can't go back to an earlier move while playing online.  You will be able to traverse the move history when the game has ended.", "Move history not available");
            return;
        }
        game.selectTurn(turn);
        game = game;
        updateRotation();
    }

    function goBack() {
        if (game.turn > 1) {
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

    function receiveMessage(event) {
        const message = JSON.parse(event.data);
        switch (message.action) {
            case "newgame":
                gameid = message.id;
                gameHost = true;
                break;
            case "cancelgame":
                gameid = null;
                gameHost = false;
                hostWhite = true;
                break;
            case "joingame":
                gameid = message.id;
                gameHost = false;
                hostWhite = message.host_plays_white;
                loadGameFromMessage(message.game);
                hideJoin();
                break;
            case "hostgame":
                gameid = message.id;
                gameHost = true;
                hostWhite = message.host_plays_white;
                loadGameFromMessage(message.game);
                hideInvite();
                break;
            case "move":
                gameid = message.id;
                loadGameFromMessage(message.game);
                break;
        }
    }

    function loadGameFromMessage(message) {
        const moves = [];
        for (let i = 0; i < message.moves.length; i++) {
            const item = message.moves[i];
            const move = new Move(
                item.piece,
                new Ref(item.from.row, item.from.col),
                new Ref(item.to.row, item.to.col),
                item.capture,
                item.board,
                item.nag
            );
            moves.push(move);
        }
        game.board = message.board;
        game.moves = moves;
        game.turn = message.turn;
        for (const k in message.tags) {
            game.tags[k] = message.tags[k];
        }
        game = game;
    }

    function openSocket() {
        if (ws == null || ws.readyState > 1) {
            ws = new WebSocket("wss://4r1vqir6nj.execute-api.ap-southeast-2.amazonaws.com/prod/");
            ws.onmessage = receiveMessage;
            ws.onopen = function(event) {
                while (messageQueue.length > 0) {
                    const message = messageQueue.shift();
                    ws.send(message);
                }
            };
            ws.onclose = function(event) {
                ws = null;
            };
        }
        return ws;
    }

    function sendMessage(data) {
        openSocket();
        const message = JSON.stringify(data);
        switch (ws.readyState) {
            case 0:
                messageQueue.push(message);
                break;
            case 1:
                ws.send(message);
                break;
            case 2:
            case 3:
                console.log("Failed to send: socket is not open.");
                break;
        }
    }

    function createInvite() {
        window.$('#invite_modal').modal('show');
        sendMessage({
            action: "newgame",
            host_plays_white: hostWhite,
            game: game
        });
    }

    function cancelInvite() {
        sendMessage({
            action: "cancelgame",
            id: gameid
        });
        hideInvite()
        gameid = null;
        gameHost = false;
        hostWhite = true;
    }

    function joinGame() {
        sendMessage({
            action: "joingame",
            id: joincode
        });
    }

    function hideInvite() {
        window.$('#invite_modal').modal('hide');
    }

    function showJoin() {
        window.$('#join_modal').modal('show');
    }

    function hideJoin() {
        window.$('#join_modal').modal('hide');
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

    function setPromotionWhite(index) {
        if (index >= 0 && index < PROMOTIONS_WHITE.length) {
            promotionWhite = index;
        }
    }

    function setPromotionBlack(index) {
        if (index >= 0 && index < PROMOTIONS_BLACK.length) {
            promotionBlack = index;
        }
    }
</script>

<main>
    <div class="ui modal" id="invite_modal">
        <div class="header">Invite a player to this game</div>
        <div class="content">
            <p>Send your opponent the following code:</p>
            <h1 class="ui center aligned block header {(gameid) ? '' : 'dimmable dimmed'}">
                {gameid}
                <div class="ui {(gameid) ? '' : 'active'} dimmer">
                    <div class="ui {(gameid) ? '' : 'active'} loader"></div>
                </div>
            </h1>
            <p>They can click <strong>"Join game"</strong> and input the code in their own browser to join you.</p>
        </div>
        <div class="actions">
            <div class="ui negative button" on:click={cancelInvite}>Cancel</div>
        </div>
    </div>

    <div class="ui modal" id="join_modal">
        <i class="close icon"></i>
        <div class="header">Join a game</div>
        <div class="content">
            <p>The game host will send you a code.  Type it in here!</p>
            <div class="ui fluid massive input">
                <input type="text" placeholder="Game code" bind:value={joincode}>
            </div>
        </div>
        <div class="actions">
            <div class="ui basic button" on:click={hideJoin}>Dismiss</div>
            <div class="ui positive button" on:click={joinGame}>Join</div>
        </div>
    </div>


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

    <div class="ui modal" id="promote_modal_white">
        <div class="header">Choose your pawn's promotion:</div>
        <div class="content">
            <div class="ui massive four buttons">
                {#each PROMOTIONS_WHITE as piece, i}
                <div class="ui button {(promotionWhite == i) ? 'active': ''}" on:click={() => setPromotionWhite(i)}>
                    <div>{piece}</div>
                </div>
                {/each}
            </div>
        </div>
        <div class="actions">
            <div class="ui primary button" on:click={promoteWhiteCall}>Promote</div>
        </div>
    </div>

    <div class="ui modal" id="promote_modal_black">
        <div class="header">Choose your pawn's promotion:</div>
        <div class="content">
            <div class="ui massive four buttons">
                {#each PROMOTIONS_BLACK as piece, i}
                <div class="ui button {(promotionBlack == i) ? 'active': ''}" on:click={() => setPromotionBlack(i)}>
                    <div>{piece}</div>
                </div>
                {/each}
            </div>
        </div>
        <div class="actions">
            <div class="ui primary button" on:click={promoteBlackCall}>Promote</div>
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
                {isPlayerTurn}
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
                        <div class="ui button" on:click={createInvite}><i class="user plus icon"></i> Invite player</div>
                        <div class="ui button" on:click={showJoin}><i class="handshake icon"></i> Join game</div>
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
                    {#if gameid}
                    {:else}
                    <div class="ui two buttons">
                        <div class="ui {(game.turn < 2) ? 'disabled' : ''} button" on:click={goBack}><i class="step backward icon"></i> Back</div>
                        <div class="ui {(game.turn == game.moves.length + 1) ? 'disabled' : ''} button" on:click={goForward}><i class="step forward icon"></i> Forward</div>
                    </div>
                    {/if}
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
                            <span class="text center"><big>{move.piece}</big></span>
                        </div>
                        <div class="six wide column">
                            {move.from.label} <i class="long arrow alternate right icon"></i> {move.to.label}
                        </div>
                        <div class="two wide column">
                            <span class="text center"><big>{move.capture}</big></span>
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
