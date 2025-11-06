<script lang="ts">
  export let size: 'normal' | 'large' = 'normal';
  export let text: string = 'Loading...';
</script>

<div class="loading-spinner {size}">
  <div class="spinner"></div>
  {#if text}
    <p>{text}</p>
  {/if}
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  
  .loading-spinner.large {
    gap: 25px;
  }

  .spinner {
    border: 5px solid #f3f3f3;
    border-top: 5px solid var(--primary-blue);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  .loading-spinner.large .spinner {
    width: 80px;
    height: 80px;
    border-width: 6px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>