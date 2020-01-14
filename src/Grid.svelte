<script>
    export let game;
</script>

<table>
    <thead>
        <tr>
            <th></th>
            <th>a</th>
            <th>b</th>
            <th>c</th>
            <th>d</th>
            <th>e</th>
            <th>f</th>
            <th>g</th>
            <th>h</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>8</th>
            <td>{game[56]}</td>
            <td>{game[57]}</td>
            <td>{game[58]}</td>
            <td>{game[59]}</td>
            <td>{game[60]}</td>
            <td>{game[61]}</td>
            <td>{game[62]}</td>
            <td>{game[63]}</td>
            <th>8</th>
        </tr>
        <tr>
            <th>7</th>
            <td>{game[48]}</td>
            <td>{game[49]}</td>
            <td>{game[50]}</td>
            <td>{game[51]}</td>
            <td>{game[52]}</td>
            <td>{game[53]}</td>
            <td>{game[54]}</td>
            <td>{game[55]}</td>
            <th>7</th>
        </tr>
        <tr>
            <th>6</th>
            <td>{game[40]}</td>
            <td>{game[41]}</td>
            <td>{game[42]}</td>
            <td>{game[43]}</td>
            <td>{game[44]}</td>
            <td>{game[45]}</td>
            <td>{game[46]}</td>
            <td>{game[47]}</td>
            <th>6</th>
        </tr>
        <tr>
            <th>5</th>
            <td>{game[32]}</td>
            <td>{game[33]}</td>
            <td>{game[34]}</td>
            <td>{game[35]}</td>
            <td>{game[36]}</td>
            <td>{game[37]}</td>
            <td>{game[38]}</td>
            <td>{game[39]}</td>
            <th>5</th>
        </tr>
        <tr>
            <th>4</th>
            <td>{game[24]}</td>
            <td>{game[25]}</td>
            <td>{game[26]}</td>
            <td>{game[27]}</td>
            <td>{game[28]}</td>
            <td>{game[29]}</td>
            <td>{game[30]}</td>
            <td>{game[31]}</td>
            <th>4</th>
        </tr>
        <tr>
            <th>3</th>
            <td>{game[16]}</td>
            <td>{game[17]}</td>
            <td>{game[18]}</td>
            <td>{game[19]}</td>
            <td>{game[20]}</td>
            <td>{game[21]}</td>
            <td>{game[22]}</td>
            <td>{game[23]}</td>
            <th>3</th>
        </tr>
        <tr>
            <th>2</th>
            <td>{game[8]}</td>
            <td>{game[9]}</td>
            <td>{game[10]}</td>
            <td>{game[11]}</td>
            <td>{game[12]}</td>
            <td>{game[13]}</td>
            <td>{game[14]}</td>
            <td>{game[15]}</td>
            <th>2</th>
        </tr>
        <tr>
            <th>1</th>
            <td>{game[0]}</td>
            <td>{game[1]}</td>
            <td>{game[2]}</td>
            <td>{game[3]}</td>
            <td>{game[4]}</td>
            <td>{game[5]}</td>
            <td>{game[6]}</td>
            <td>{game[7]}</td>
            <th>1</th>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th></th>
            <th>a</th>
            <th>b</th>
            <th>c</th>
            <th>d</th>
            <th>e</th>
            <th>f</th>
            <th>g</th>
            <th>h</th>
            <th></th>
        </tr>
    </tfoot>
</table>

<style>
    table {
        margin: 4ex auto;
    }
    td {
        text-align: center;
        vertical-align: middle;
        width: 4ex;
        height: 4ex;
        font-size: 400%;
    }
    th {
        text-align: center;
        vertical-align: middle;
        padding: 4ex 4ex;
    }
    tr:nth-child(even) > td:nth-child(odd), tr:nth-child(odd) > td:nth-child(even) {
        background-color: #ddd;
    }
</style>
