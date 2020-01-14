<script>
    import Cell from './Cell.svelte';

    export let game;
    export let doMove;
    export let getCellIndex;
    export let getColumnLabel;

    let pos = -1;
    let col = -1;
    let row = -1;

    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];

    function setPosition(index) {
        pos = index;
        if (pos >= 0) {
            row = Math.floor(pos / 8) + 1;
            col = (pos % 8) + 1;
        } else {
            col = -1;
            row = -1;
        }
    }

    function selectCell(index) {
        if (pos == index) {
            setPosition(-1);
        } else if (pos >= 0 && game[pos] != ' ') {
            if (doMove(pos, index)) {
                setPosition(-1);
            }
        } else if (game[index] != ' ') {
            setPosition(index);
        }
    }
</script>

<table>
    <thead>
        <tr>
            <th></th>
            {#each cols as c}
            <th class={c == col ? 'selected' : ''}>{getColumnLabel(c)}</th>
            {/each}
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each rows as r}
        <tr>
            <th class={r == row ? 'selected' : ''}>{r}</th>
            {#each cols as c}
            <Cell
                value={game[getCellIndex(c, r)]}
                on:click={() => selectCell(getCellIndex(c, r))}
                selected={c == col && r == row}
                />
            {/each}
            <th class={r == row ? 'selected' : ''}>{r}</th>
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            {#each cols as c}
            <th class={c == col ? 'selected' : ''}>{getColumnLabel(c)}</th>
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
