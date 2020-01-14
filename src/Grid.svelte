<script>
    export let game;

    let pos = [0, 0];
    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];

    import Cell from './Cell.svelte';

    function getColumnLabel(col) {
        return String.fromCharCode('a'.charCodeAt(0) + col - 1);
    }

    function getGameCell(col, row) {
        return game[(8 * (row - 1)) + col - 1];
    }

    const selectCell = (col, row) => pos = [col, row];
</script>

<table>
    <thead>
        <tr>
            <th></th>
            {#each cols as col}
            <th class={col == pos[0] ? 'selected' : ''}>{getColumnLabel(col)}</th>
            {/each}
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each rows as row}
        <tr>
            <th class={row == pos[1] ? 'selected' : ''}>{row}</th>
            {#each cols as col}
            <Cell
                value={getGameCell(col, row)}
                on:click={() => selectCell(col, row)}
                selected={col == pos[0] && row == pos[1]}
                row={row}
                col={col}
                />
            {/each}
            <th class={row == pos[1] ? 'selected' : ''}>{row}</th>
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            {#each cols as col}
            <th class={col == pos[0] ? 'selected' : ''}>{getColumnLabel(col)}</th>
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
