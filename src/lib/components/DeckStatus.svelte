<script lang="ts">
  import type { DeckState } from '../types/deck';
  import { createEventDispatcher } from 'svelte';

  export let deckState: DeckState;
  export let showTooltip: boolean = false;
  
  const dispatch = createEventDispatcher();

  function handleMouseEnter(): void {
    dispatch('tooltipshow');
  }
  
  function handleMouseLeave(): void {
    dispatch('tooltiphide');
  }
</script>

<div class="status">
  <p class="status-item">
    Колода: 
    {#if deckState.deckId}
      <strong 
        class="deck-id" 
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
      >
        {deckState.deckId.slice(0, 8)}...
      </strong>
    {:else}
      <strong>...</strong>
    {/if}
  </p>
  <p class="status-item">
    Осталось карт: <strong>{deckState.deckId ? deckState.remainingCards : '...'}</strong>
  </p>
  
  {#if showTooltip && deckState.deckId}
    <div class="tooltip">
      {deckState.deckId}
    </div>
  {/if}
</div>

<style>
  .status {
    flex: 1;
    min-width: 200px;
    position: relative;
  }

  .status-item {
    margin: 8px 0;
    font-size: 1.1em;
    line-height: 1.4;
  }

  .deck-id {
    cursor: pointer;
    text-decoration: underline;
    color: var(--primary-blue);
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    top: -27px;
    left: 15%;
    transform: translateX(-50%);
    background: var(--tooltip-dark);
    color: white;
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-shadow: var(--button-shadow);
    animation: tippy-fade 0.2s ease-out;
    white-space: nowrap;
    z-index: 1000;
    max-width: 300px;
    word-break: break-all;
    text-align: center;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--tooltip-dark);
  }

  @keyframes tippy-fade {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>