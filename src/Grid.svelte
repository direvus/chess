<script>
    export let game;

    const rows = [8, 7, 6, 5, 4, 3, 2, 1];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    import Cell from './Cell.svelte';
</script>

<table>
    <thead>
        <tr>
            <th></th>
            {#each cols as col}
            <th>{col}</th>
            {/each}
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each rows as row}
        <tr>
            <th>{row}</th>
            {#each cols as col, i}
            <Cell value={game[(8 * (row-1)) + i]} row={row} col={col}/>
            {/each}
            <th>{row}</th>
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            {#each cols as col}
            <th>{col}</th>
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
    }
</style>
