<script lang="ts">
  import { createDecks, drawCards, shuffleDecks } from '$lib/deckAPI';
  import type { Card, DeckState } from '$lib/types/deck';
  import type { LoadingStates } from '$lib/types/app';
  
  import Button from '$lib/components/Button.svelte';
  import DeckStatus from '$lib/components/DeckStatus.svelte';
  import CardImage from '$lib/components/CardImage.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorAlert from '$lib/components/ErrorAlert.svelte';
  
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import { onMount } from 'svelte';

  // Импортируем CSS переменные
  import '$lib/theme/colors.css';

  // State
  let deckState: DeckState = {
    deckId: null,
    remainingCards: 0,
    currentCard: null,
    drawnCards: []
  };

  let loadingStates: LoadingStates = {
    isLoading: false,
    isDrawingCard: false,
    isShuffling: false,
    isRecreating: false
  };

  let error: string | null = null;
  let showDeckIdTooltip: boolean = false;

  // Actions
  async function createNewDeck(): Promise<void> {
    if (deckState.deckId) {
      loadingStates.isRecreating = true;
    } else {
      loadingStates.isLoading = true;
    }
    
    error = null;
    
    try {
      const data = await createDecks();
      
      if (data.success) {
        deckState = {
          deckId: data.deck_id,
          remainingCards: data.remaining,
          currentCard: null,
          drawnCards: []
        };
      } else {
        error = 'Не удалось создать колоду';
      }
    } catch (err) {
      error = `Ошибка сети: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`;
    }
    
    loadingStates.isLoading = false;
    loadingStates.isRecreating = false;
  }

  async function drawCard(): Promise<void> {
    if (!deckState.deckId || deckState.remainingCards === 0) return;
    
    loadingStates.isDrawingCard = true;
    error = null;
    
    try {
      const data = await drawCards(deckState.deckId, 1);
      
      if (data.success && data.cards && data.cards.length > 0) {
        const newCard: Card = data.cards[0];
        deckState.currentCard = newCard;
        deckState.remainingCards = data.remaining;
        deckState.drawnCards = [newCard, ...deckState.drawnCards];
      } else {
        error = 'Не удалось вытянуть карту';
      }
    } catch (err) {
      error = `Ошибка сети: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`;
    }
    
    loadingStates.isDrawingCard = false;
  }

  async function shuffleDeck(): Promise<void> {
    if (!deckState.deckId) return;
    
    loadingStates.isShuffling = true;
    error = null;
    
    try {
      const data = await shuffleDecks(deckState.deckId);
      
      if (data.success) {
        deckState.remainingCards = data.remaining;
        deckState.drawnCards = [];
        deckState.currentCard = null;
      } else {
        error = 'Не удалось перетасовать колоду';
      }
    } catch (err) {
      error = `Ошибка сети: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`;
    }
    
    loadingStates.isShuffling = false;
  }

  function handleTooltipShow(): void {
    showDeckIdTooltip = true;
  }

  function handleTooltipHide(): void {
    showDeckIdTooltip = false;
  }

  onMount(() => {
    // Initialize tooltips
    tippy('#create-btn', {
      content: 'Создать новую колоду карт'
    });
    
    tippy('#draw-btn', {
      content: 'Вытянуть одну карту из колоды'
    });
    
    tippy('#shuffle-btn', {
      content: 'Перетасовать оставшиеся карты'
    });
  });
</script>

<svelte:head>
  <title>Deck Of Cards</title>
</svelte:head>

<main>
  <h1>🃏 Deck Of Cards</h1>
  <div class="container">
    <!-- Status and Controls -->
    <div class="controls">
      <DeckStatus 
        deckState={deckState}
        showTooltip={showDeckIdTooltip}
        on:tooltipshow={handleTooltipShow}
        on:tooltiphide={handleTooltipHide}
      />
      
      <div class="buttons">
        <Button
          id="create-btn"
          on:click={createNewDeck}
          disabled={loadingStates.isLoading || loadingStates.isRecreating}
        >
          {#if loadingStates.isLoading}
            Загрузка...
          {:else if loadingStates.isRecreating}
            Пересоздание...
          {:else}
            {deckState.deckId ? 'Пересоздать' : 'Создать колоду'}
          {/if}
        </Button>
        
        <Button
          id="draw-btn"
          on:click={drawCard}
          disabled={loadingStates.isDrawingCard || !deckState.deckId || deckState.remainingCards === 0}
        >
          {loadingStates.isDrawingCard ? 'Вытягиваем...' : 'Вытянуть'}
        </Button>
        
        <Button
          id="shuffle-btn"
          on:click={shuffleDeck}
          disabled={loadingStates.isShuffling || !deckState.deckId}
        >
          {loadingStates.isShuffling ? 'Перетасовка...' : 'Перетасовать'}
        </Button>
      </div>
    </div>

    <!-- Error Message -->
    <ErrorAlert message={error} />

    <!-- Main Content (only shown when deck exists) -->
    {#if deckState.deckId}
      <div class="content">
        <!-- Current Card -->
        <div class="current-card-section">
          <h2>Текущая карта:</h2>
          <div class="current-card">
            {#if loadingStates.isRecreating}
              <LoadingSpinner size="large" text="Пересоздаем колоду..." />
            {:else if loadingStates.isShuffling}
              <LoadingSpinner size="large" text="Перетасовываем колоду..." />
            {:else if loadingStates.isDrawingCard}
              <LoadingSpinner size="large" text="Вытягиваем карту..." />
            {:else if deckState.currentCard}
              <div class="card-with-info">
                <CardImage 
                  card={deckState.currentCard} 
                  size="main" 
                  showInfo={false}
                  interactive={true}
                />
                <div class="card-info">
                  <p class="card-name"><strong>{deckState.currentCard.value} of {deckState.currentCard.suit}</strong></p>
                  <p class="card-code">Код: {deckState.currentCard.code}</p>
                </div>
              </div>
            {:else}
              <div class="no-card">
                <p>Карта не вытянута</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Drawn Cards History -->
        <div class="history-section">
          <h2>История карт ({deckState.drawnCards.length})</h2>
          <div class="cards-grid-container">
            <div class="cards-grid">
              {#each deckState.drawnCards as card}
                <div class="history-card">
                  <CardImage 
                    card={card} 
                    size="small" 
                    showInfo={false}
                    interactive={true}
                  />
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {:else if !loadingStates.isLoading}
      <!-- Empty state when no deck exists -->
      <div class="empty-state">
        <p>🎴 Нажмите "Создать колоду", чтобы начать!</p>
      </div>
    {/if}

    <!-- Loading state only for creating first deck -->
    {#if loadingStates.isLoading && !deckState.deckId}
      <div class="loading">
        <LoadingSpinner text="Загрузка..." />
      </div>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--main-gradient);
    min-height: 100vh;
    color: #333;
    overflow-x: hidden;
  }

  :global(html) {
    overflow-x: hidden;
  }

  main {
    padding: 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }

  .container {
    width: 100%;
    max-width: 1400px;
    background: white;
    border-radius: var(--border-radius);
    padding: 30px;
    box-shadow: var(--container-shadow);
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 400px;
  }

  h1 {
    text-align: center;
    color: var(--text-dark);
    margin-bottom: 30px;
    font-size: 2.5em;
    font-weight: 700;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    margin-bottom: 30px;
    padding: 25px;
    background: var(--background-light);
    border-radius: var(--border-radius);
    flex-wrap: wrap;
  }

  .buttons {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 40px;
    align-items: start;
    min-height: 420px;
  }

  .current-card-section,
  .history-section {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .current-card-section h2,
  .history-section h2 {
    margin-bottom: 20px;
    font-size: 1.5em;
    text-align: center;
    flex-shrink: 0;
    height: 40px;
  }

  .current-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 25px;
    background: var(--card-background);
    border-radius: var(--border-radius);
    height: 380px;
    flex: 1;
    box-sizing: border-box;
  }

  .card-with-info {
    display: flex;
    align-items: center;
    gap: 30px;
    justify-content: center;
    width: 100%;
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

  .no-card {
    text-align: center;
    color: var(--text-gray);
    font-size: 1.2em;
  }

  .cards-grid-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 380px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    overflow-y: auto;
    padding: 10px;
    flex: 1;
    max-height: 380px;
    box-sizing: border-box;
    width: 100%;
  }

  .cards-grid::-webkit-scrollbar {
    width: 6px;
  }

  .cards-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .cards-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .cards-grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .history-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    color: var(--text-gray);
    font-size: 1.3em;
    line-height: 1.5;
    background: var(--background-light);
    border-radius: var(--border-radius);
    margin: 20px 0;
  }

  .loading {
    text-align: center;
    padding: 60px;
  }

  /* Большие планшеты и маленькие ноутбуки */
  @media (max-width: 1280px) and (min-width: 1025px) {
    .container {
      margin: 0 30px;
      padding: 25px;
    }
    
    .content {
      grid-template-columns: 1fr 350px;
      gap: 30px;
      min-height: 380px;
    }
    
    .current-card {
      height: 350px;
    }
    
    .cards-grid-container {
      min-height: 350px;
    }
    
    .cards-grid {
      max-height: 350px;
    }
  }

  /* Планшеты в альбомной ориентации */
  @media (max-width: 1024px) and (min-width: 821px) {
    .container {
      margin: 0 20px;
      padding: 25px;
    }

    h1 {
      font-size: 2.2em;
    }

    .controls {
      gap: 20px;
      padding: 20px;
    }

    .content {
      grid-template-columns: 1fr 320px;
      gap: 25px;
      min-height: 380px;
    }

    .current-card {
      height: 350px;
    }

    .cards-grid-container {
      min-height: 350px;
    }

    .cards-grid {
      max-height: 350px;
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Планшеты в портретной ориентации (820x1180) */
  @media (max-width: 820px) and (min-width: 769px) {
    .container {
      margin: 0 15px;
      padding: 20px;
    }

    h1 {
      font-size: 2em;
      margin-bottom: 25px;
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
      gap: 25px;
      padding: 20px;
    }

    .buttons {
      justify-content: center;
      flex-wrap: wrap;
    }

    .content {
      grid-template-columns: 1fr 300px;
      gap: 25px;
      min-height: 350px;
    }

    .current-card {
      height: 320px;
    }

    .cards-grid-container {
      min-height: 320px;
    }

    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
      max-height: 320px;
    }
  }

  /* Маленькие планшеты и большие телефоны */
  @media (max-width: 768px) {
    main {
      padding: 15px;
    }

    .container {
      margin: 0 15px;
      padding: 20px;
      border-radius: 12px;
    }

    h1 {
      font-size: 2em;
      margin-bottom: 25px;
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
      gap: 25px;
      padding: 20px;
    }

    .buttons {
      justify-content: center;
      flex-wrap: wrap;
    }

    .content {
      grid-template-columns: 1fr;
      gap: 30px;
      min-height: auto;
    }

    .history-section {
      grid-column: 1;
    }

    .current-card {
      height: 320px;
    }

    .cards-grid-container {
      min-height: 300px;
    }

    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
      max-height: 300px;
    }

    .empty-state {
      padding: 40px;
      font-size: 1.2em;
    }
  }

  /* Телефоны в альбомной ориентации (853x1280) */
  @media (max-width: 853px) and (min-width: 481px) and (orientation: landscape) {
    .container {
      margin: 0 10px;
      padding: 15px;
    }

    h1 {
      font-size: 1.8em;
      margin-bottom: 20px;
    }

    .controls {
      padding: 15px;
      gap: 20px;
      flex-direction: row;
    }

    .buttons {
      gap: 8px;
    }

    .content {
      grid-template-columns: 1fr 280px;
      gap: 20px;
      min-height: 300px;
    }

    .current-card {
      height: 280px;
    }

    .cards-grid-container {
      min-height: 280px;
    }

    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
      max-height: 280px;
    }
  }

  /* Мобильные телефоны */
  @media (max-width: 480px) {
    main {
      padding: 10px;
    }

    .container {
      margin: 0 10px;
      padding: 15px;
    }

    h1 {
      font-size: 1.8em;
      margin-bottom: 20px;
    }

    .controls {
      padding: 15px;
      gap: 20px;
    }

    .buttons {
      gap: 8px;
    }

    .content {
      gap: 25px;
    }

    .current-card {
      padding: 20px;
      height: 280px;
    }

    .card-with-info {
      flex-direction: column;
      gap: 20px;
    }

    .cards-grid-container {
      min-height: 250px;
    }

    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      max-height: 250px;
    }

    .empty-state {
      padding: 30px;
      font-size: 1.1em;
    }

    .history-section h2 {
      font-size: 1.3em;
    }
  }

  /* Очень маленькие телефоны */
  @media (max-width: 360px) {
    .container {
      margin: 0 5px;
    }

    .buttons {
      gap: 6px;
    }

    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
      max-height: 200px;
    }

    h1 {
      font-size: 1.6em;
    }
  }
</style>