<script lang="ts">
    import Grid from '$lib/Grid.svelte';
    import Menu from '$lib/Menu.svelte';
    import Status from '$lib/Status.svelte';
    import Message from '$lib/Message.svelte';

    import {Game, Ref, Move,
        WHITE_PAWN, WHITE_KING, WHITE_QUEEN,
        WHITE_KNIGHT, WHITE_ROOK, WHITE_BISHOP,
        BLACK_PAWN, BLACK_KING, BLACK_QUEEN,
        BLACK_KNIGHT, BLACK_ROOK, BLACK_BISHOP,
        readPGN, getPGNDate} from '$lib/chess.js';

    let game = new Game();

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
    let hostWhite = true;
    let playerSide = null;
    let playerName = '';
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

    function showSuccess(text, header='') {
        message = {
            "level": "success",
            "icon": "check circle",
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
        gameid = null;
        updateRotation();
    }

    function editGame() {
        window.$('#edit_modal').modal('show');
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
        return (playerSide == (game.turn % 2));
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
        let side = null;
        let success = null;
        switch (message.action) {
            case "newgame":
                gameid = message.id;
                joincode = null;
                break;
            case "cancelgame":
                gameid = null;
                joincode = null;
                playerSide = null;
                break;
            case "joingame":
                joincode = null;
                gameid = message.id;
                hostWhite = message.host_plays_white;
                playerSide = (hostWhite) ? 0 : 1;
                loadGameFromMessage(message.game);
                hideJoin();

                side = (playerSide) ? 'White' : 'Black';
                success = "OK!  You have joined the game.  You are playing " + side + ".";

                showSuccess(success, "Game joined");
                break;
            case "hostgame":
                gameid = message.id;
                hostWhite = message.host_plays_white;
                playerSide = (hostWhite) ? 1 : 0;
                loadGameFromMessage(message.game);
                hideInvite();

                side = (playerSide) ? 'White' : 'Black';
                let tagname = (playerSide) ? 'Black' : 'White';
                let guest = 'A player';
                if (game.tags[tagname]) {
                    guest = game.tags[tagname];
                }
                success = "OK!  " + guest + " has joined the game.  You are playing " + side + ".";
                showSuccess(success, "Player joined");
                break;
            case "move":
                gameid = message.id;
                loadGameFromMessage(message.game);
                break;
            case "resign":
                receiveResignation(message);
                break;
            case "draw":
                showMessage("Both players have agreed to end the game in a draw.", "Draw agreed");
                game.result = 0.5;
                game.updateResultTag();
                gameid = null;
                game = game;
                break;
            case "offerdraw":
                showRespondDraw();
                break;
            case "declinedraw":
                hideOfferDraw();
                showMessage("Your opponent has declined your offer of a draw.", "Draw declined");
                break;
        }
    }

    function receiveResignation(message) {
        game.result = message.result;
        game.tags["Result"] = message.tag;
        gameid = null;
        game = game;
        const resigned = (game.result) ? 'Black' : 'White';
        if (game.result == playerSide) {
            showSuccess("Your opponent has resigned.  You win the game!  Congratulations.", resigned + " resigns");
        } else {
            showMessage("You have resigned.  Your opponent wins!  Thanks for playing.", resigned + " resigns");
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
        const result = game.getResult();
        if (result != null) {
            game.result = result;
            game.updateResultTag();
            gameid = null;
        }
        game = game;
    }

    function openSocket() {
        if (ws == null || ws.readyState > 1) {
            ws = new WebSocket("wss://4r1vqir6nj.execute-api.ap-southeast-2.amazonaws.com/prod/");
            ws.onmessage = receiveMessage;
            ws.onopen = function() {
                while (messageQueue.length > 0) {
                    const message = messageQueue.shift();
                    ws.send(message);
                }
            };
            ws.onclose = function() {
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
        window.$('#newgame_modal').modal('hide');
        window.$('#invite_modal').modal('show');
        const playerKey = (hostWhite) ? 'White' : 'Black';
        game.tags[playerKey] = playerName;
        game.tags['Date'] = getPGNDate();
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
        hostWhite = true;
        playerSide = null;
    }

    function joinGame() {
        sendMessage({
            action: "joingame",
            name: playerName,
            id: joincode
        });
    }

    function resignGame() {
        sendMessage({
            action: "resign",
            id: gameid
        });
    }

    function offerDraw() {
        sendMessage({
            action: "draw",
            mode: "offer",
            id: gameid
        });
        hideOfferDraw();
    }

    function agreeDraw() {
        sendMessage({
            action: "draw",
            mode: "agree",
            id: gameid
        });
        hideRespondDraw();
    }

    function declineDraw() {
        sendMessage({
            action: "draw",
            mode: "decline",
            id: gameid
        });
        hideRespondDraw();
    }

    function showNewGame() {
        window.$('#newgame_modal').modal('show');
    }

    function hideNewGame() {
        window.$('#newgame_modal').modal('hide');
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

    function showResign() {
        window.$('#resign_modal').modal('show');
    }

    function hideResign() {
        window.$('#resign_modal').modal('hide');
    }

    function showOfferDraw() {
        window.$('#draw_offer_modal').modal('show');
    }

    function hideOfferDraw() {
        window.$('#draw_offer_modal').modal('hide');
    }

    function showRespondDraw() {
        window.$('#draw_respond_modal').modal('show');
    }

    function hideRespondDraw() {
        window.$('#draw_respond_modal').modal('hide');
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

    function setHostWhite(white=true) {
        hostWhite = white;
        return hostWhite;
    }
</script>

<main>
    <Menu
        result={game.result}
        white={game.tags['White']}
        black={game.tags['Black']}
        {gameid}
        {autorotate}
        {resetGame}
        {editGame}
        {showImport}
        {showNewGame}
        {showJoin}
        {showResign}
        {showOfferDraw}
        {exportGame}
        {rotateBoard}
        />

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
            <button class="ui negative button" on:click={cancelInvite}>Cancel</button>
        </div>
    </div>

    <div class="ui modal" id="join_modal">
        <i class="close icon"></i>
        <div class="header">Join an online game</div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <label for="name_input">Your name</label>
                    <input id="name_input" type="text" placeholder="Your name" bind:value={playerName}>
                </div>
                <p>The game host will send you a code.  Type it in here!</p>
                <div class="field">
                    <label for="code_input">Game code</label>
                    <div class="ui massive input">
                        <input id="code_input" type="text" placeholder="Game code" bind:value={joincode}>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <button class="ui basic button" on:click={hideJoin}>Dismiss</button>
            <button class="ui positive button" on:click={joinGame}>Join</button>
        </div>
    </div>

    <div class="ui modal" id="resign_modal">
        <i class="close icon"></i>
        <div class="header">Resign the game</div>
        <div class="content">
            <p>Would you like to resign from this game?</p>
        </div>
        <div class="actions">
            <button class="ui basic button" on:click={hideResign}>Cancel</button>
            <button class="ui positive button" on:click={resignGame}>Resign</button>
        </div>
    </div>

    <div class="ui modal" id="draw_offer_modal">
        <i class="close icon"></i>
        <div class="header">Offer a draw</div>
        <div class="content">
            <p>Would you like to offer the other player a draw?</p>
        </div>
        <div class="actions">
            <button class="ui basic button" on:click={hideOfferDraw}>Cancel</button>
            <button class="ui positive button" on:click={offerDraw}>Offer draw</button>
        </div>
    </div>

    <div class="ui modal" id="draw_respond_modal">
        <i class="close icon"></i>
        <div class="header">A draw has been offered</div>
        <div class="content">
            <p>The other player has offered to end the game in a draw.  How will you respond?</p>
        </div>
        <div class="actions">
            <button class="ui negative button" on:click={declineDraw}>Decline</button>
            <button class="ui positive button" on:click={agreeDraw}>Agree to a draw</button>
        </div>
    </div>

    <div class="ui modal" id="import_modal">
        <i class="close icon"></i>
        <div class="header">Game import</div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <label for="import_input">Enter a game in <a href="https://www.chessclub.com/help/PGN-spec">Portable Game Notation (PGN)</a></label>
                    <textarea id="import_input" bind:value={importText} rows="12"></textarea>
                </div>
            </div>
        </div>
        <div class="actions">
            <button class="ui positive button" on:click={importGame}>Import</button>
            <button class="ui button" on:click={hideImport}>Dismiss</button>
        </div>
    </div>

    <div class="ui modal" id="export_modal">
        <i class="close icon"></i>
        <div class="header">Game export</div>
        <pre><code>{exportPGN}</code></pre>
        <div class="actions">
            <button class="ui primary button" on:click={hideExport}>Dismiss</button>
        </div>
    </div>

    <div class="ui modal" id="message_modal">
        <i class="close icon"></i>
        <Message {...message}/>
        <div class="actions">
            <button class="ui primary button" on:click={hideMessage}>Dismiss</button>
        </div>
    </div>

    <div class="ui modal" id="newgame_modal">
        <i class="close icon"></i>
        <div class="header">
            Start a new online game
        </div>
        <div class="content">
            <div class="ui form">
                <h4 class="ui dividing header">Player details</h4>
                <div class="field">
                    <label for="player_name_input">Your name</label>
                    <input id="player_name_input" type="text" placeholder="Your name" bind:value={playerName}>
                </div>
                <div class="field">
                    <label for="side_input">Your side</label>
                    <div id="side_input" class="ui massive two buttons">
                        <button class="ui button {(hostWhite) ? 'active': ''}" on:click={() => setHostWhite(true)}>
                            <div>{WHITE_KING}</div>
                            <div><small>White</small></div>
                        </button>
                        <button class="ui button {(hostWhite) ? '': 'active'}" on:click={() => setHostWhite(false)}>
                            <div>{BLACK_KING}</div>
                            <div><small>Black</small></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <button class="ui basic button" on:click={hideNewGame}>Cancel</button>
            <button class="ui positive button" on:click={createInvite}>Start game</button>
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
                        <label for="event_name_input">Event name</label>
                        <input id="event_name_input" type="text" placeholder="Event name" bind:value={game.tags["Event"]}>
                    </div>
                    <div class="field">
                        <label for="event_location_input">Event location</label>
                        <input id="event_location_input" type="text" placeholder="Event location" bind:value={game.tags["Site"]}>
                    </div>
                    <div class="field">
                        <label for="date_input">Date</label>
                        <input id="date_input" type="text" placeholder="YYYY.MM.DD" bind:value={game.tags["Date"]}>
                    </div>
                    <div class="field">
                        <label for="round_input">Round</label>
                        <input id="round_input" type="text" placeholder="Round" bind:value={game.tags["Round"]}>
                    </div>
                </div>
                <h4 class="ui dividing header">Players</h4>
                <div class="two fields">
                    <div class="field">
                        <label for="white_player_input">White player</label>
                        <input id="white_player_input" type="text" placeholder="Lastname, firstname" bind:value={game.tags["White"]}>
                    </div>
                    <div class="field">
                        <label for="black_player_input">Black player</label>
                        <input id="black_player_input" type="text" placeholder="Lastname, firstname" bind:value={game.tags["Black"]}>
                    </div>
                </div>
                <h4 class="ui dividing header">Game result</h4>
                <div class="inline four fields">
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input id="result_incomplete_radio" type="radio" name="result" bind:group={game.tags["Result"]} value="*">
                            <label for="result_incomplete_radio">Incomplete</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input id="result_white_radio" type="radio" name="result" bind:group={game.tags["Result"]} value="1-0">
                            <label for="result_white_radio">White wins</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input id="result_black_radio" type="radio" name="result" bind:group={game.tags["Result"]} value="0-1">
                            <label for="result_black_radio">Black wins</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="ui radio checkbox">
                            <input id="result_draw_radio" type="radio" name="result" bind:group={game.tags["Result"]} value="1/2-1/2">
                            <label for="result_draw_radio">Draw</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <button class="ui primary button" on:click={hideEdit}>Close</button>
        </div>
    </div>

    <div class="ui modal" id="promote_modal_white">
        <div class="header">Choose your pawn's promotion:</div>
        <div class="content">
            <div class="ui massive four buttons">
                {#each PROMOTIONS_WHITE as piece, i}
                <button class="ui button {(promotionWhite == i) ? 'active': ''}" on:click={() => setPromotionWhite(i)}>
                    <div>{piece}</div>
                </button>
                {/each}
            </div>
        </div>
        <div class="actions">
            <button class="ui primary button" on:click={promoteWhiteCall}>Promote</button>
        </div>
    </div>

    <div class="ui modal" id="promote_modal_black">
        <div class="header">Choose your pawn's promotion:</div>
        <div class="content">
            <div class="ui massive four buttons">
                {#each PROMOTIONS_BLACK as piece, i}
                <button class="ui button {(promotionBlack == i) ? 'active': ''}" on:click={() => setPromotionBlack(i)}>
                    <div>{piece}</div>
                </button>
                {/each}
            </div>
        </div>
        <div class="actions">
            <button class="ui primary button" on:click={promoteBlackCall}>Promote</button>
        </div>
    </div>

    <div class="ui grid">
        <div class="twelve wide column">
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
        <div class="four wide computer only column" style="margin-top: 8ex;">
            <Status
                turn={game.turn}
                result={game.result}
                moves={game.moves}
                side={playerSide}
                {gameid}
                {goBack}
                {goForward}
                {selectTurn}
                />
        </div>
    </div>
</main>
