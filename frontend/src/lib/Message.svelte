<script lang="ts">
    let {
        level,
        icon,
        header,
        message
    } = $props();
</script>

<div class="ui {level} attached icon message">
    <i class="{icon} icon"></i>
    <div class="content">
        <div class="header">{header}</div>
        <p>{message}</p>
    </div>
</div>
