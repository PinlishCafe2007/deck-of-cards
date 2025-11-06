<script lang="ts">
  import type { Card } from '../types/deck';

  export let card: Card;
  export let size: 'main' | 'small' = 'main';
  export let showInfo: boolean = false;
  export let interactive: boolean = true;
</script>

<div class="card-container {size}">
  <img
    src={card.image}
    alt="{card.value} of {card.suit}"
    class="card-image {size} {interactive ? 'hover-effect' : ''}"
    title="{card.value} of {card.suit}"
  />
  
  {#if showInfo}
    <div class="card-info">
      <p class="card-name"><strong>{card.value} of {card.suit}</strong></p>
      <p class="card-code">Код: {card.code}</p>
    </div>
  {/if}
</div>

<style>
  .card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .card-image {
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .card-image.main {
    width: 220px;
    height: 308px;
  }
  
  .card-image.small {
    width: 75px;
    height: 105px;
    border-radius: 6px;
  }
  
  .card-image.hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .card-info {
    text-align: left;
    min-width: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .card-name {
    font-size: 1.5em;
    margin: 0;
    color: var(--text-dark);
  }

  .card-code {
    color: var(--text-gray);
    font-size: 1.1em;
    margin: 0;
  }
</style>