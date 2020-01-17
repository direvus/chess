<script>
    import Cell from './Cell.svelte';
    import { WHITES } from './chess.js';

    export let board;
    export let side;
    export let doMove;

    let col = -1;
    let row = -1;

    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    function clickCell(r, c) {
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
            <th></th>
            {#each cols as c, j}
            <th class={col == j ? 'selected' : ''}>{c}</th>
            {/each}
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each rows as r, i}
        <tr>
            <th class={row == i ? 'selected' : ''}>{r}</th>
            {#each cols as c, j}
            <Cell
                value={board[i][j]}
                on:click={() => clickCell(i, j)}
                selected={col == j && row == i}
                />
            {/each}
            <th class={row == i ? 'selected' : ''}>{r}</th>
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            {#each cols as c, j}
            <th class={col == j ? 'selected' : ''}>{c}</th>
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
</style>
