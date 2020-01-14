<script>
    export let value;
    export let row;
    export let col;
</script>

<td>{value}</td>

<style>
    td {
        text-align: center;
        vertical-align: middle;
        width: 4ex;
        height: 4ex;
        font-size: 400%;
    }
    tr:nth-child(even) > td:nth-child(odd), tr:nth-child(odd) > td:nth-child(even) {
        background-color: #ddd;
    }
</style>
