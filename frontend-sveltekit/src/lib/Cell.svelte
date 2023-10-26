<script>
    export let value;
    export let selected;
</script>

<td on:click class={selected ? 'selected' : ''}>{value}</td>

<style>
    td {
        text-align: center;
        vertical-align: middle;
        width: 4ex;
        height: 4ex;
        font-size: 300%;
        border: 4px solid transparent;
        transition: all .4s ease-out;
    }
    td.selected {
        border-color: black;
    }
</style>
