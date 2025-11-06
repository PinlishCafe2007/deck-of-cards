<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string = '';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  
  const dispatch = createEventDispatcher();

  function handleClick(): void {
    dispatch('click');
  }
</script>

<button
  {id}
  class="btn"
  on:click={handleClick}
  {disabled}
>
  <span class="btn-text">
    <slot />
  </span>
</button>

<style>
  .btn {
    position: relative;
    padding: 14px 0;
    width: 160px;
    height: 52px;
    border: none;
    border-radius: 10px;
    background: var(--primary-blue);
    color: white;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .btn:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-2px);
    box-shadow: var(--button-shadow);
  }

  .btn:disabled {
    background: var(--disabled-gray);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-text {
    display: inline-block;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }
</style>