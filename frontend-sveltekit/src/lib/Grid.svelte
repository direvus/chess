<script>
    import Cell from './Cell.svelte';
    import {WHITES} from './chess.js';

    export let board;
    export let side;
    export let rows;
    export let cols;
    export let rotation;
    export let doMove;
    export let rotateBoard;
    export let isPlayerTurn;

    const ROW_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let col = -1;
    let row = -1;

    function clickCell(r, c) {
        if (!isPlayerTurn()) {
            return;
        }
        if (row == r && col == c) {
            row = -1;
            col = -1;
        } else if (row >= 0 && col >= 0 && board[row][col] != ' ') {
            if (doMove(row, col, r, c)) {
                row = -1;
                col = -1;
            }
        } else if (board[r][c] != ' ' && WHITES.includes(board[r][c]) == side) {
            row = r;
            col = c;
        }
    }
</script>

<table>
    <thead>
        <tr>
            <th>
                <button class="ui toggle icon button {(rotation) ? 'active' : ''}" on:click={rotateBoard} title="Rotate board view">
                    <i class="sync alternate icon"></i>
                </button>
            </th>
            {#each cols as c}
            <th class={col == c ? 'selected' : ''}>{COL_LABELS[c]}</th>
            {/each}
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each rows as r}
        <tr>
            <th class={row == r ? 'selected' : ''}>{ROW_LABELS[r]}</th>
            {#each cols as c}
            <Cell
                value={board[r][c]}
                on:click={() => clickCell(r, c)}
                selected={col == c && row == r}
                />
            {/each}
            <th class={row == r ? 'selected' : ''}>{ROW_LABELS[r]}</th>
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            {#each cols as c}
            <th class={col == c ? 'selected' : ''}>{COL_LABELS[c]}</th>
            {/each}
            <th></th>
        </tr>
    </tfoot>
</table>

<style>
    table {
        margin: 4ex auto;
    }
    th {
        text-align: center;
        vertical-align: middle;
        padding: 4ex 4ex;
        font-weight: normal;
        color: #888;
        border: 4px solid transparent;
    }
    th.selected {
        color: #000;
        font-weight: bold;
    }
    thead th.selected {
        border-top-color: black;
    }
    tfoot th.selected {
        border-bottom-color: black;
    }
    tbody th:first-child.selected {
        border-left-color: black;
    }
    tbody th:last-child.selected {
        border-right-color: black;
    }
    tr:nth-child(odd) > :global(td:nth-child(odd)), tr:nth-child(even) > :global(td:nth-child(even)) {
        background-color: #ddd;
    }
</style>
