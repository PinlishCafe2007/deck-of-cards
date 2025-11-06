<script lang="ts">
  export let message: string | null;
</script>

{#if message}
  <div class="error-alert">
    ⚠️ {message}
  </div>
{/if}

<style>
  .error-alert {
    background: var(--error-red);
    color: white;
    padding: 16px;
    border-radius: var(--border-radius-small);
    margin: 20px 0;
    text-align: center;
    font-weight: 600;
    font-size: 1em;
    box-sizing: border-box;
  }
</style>