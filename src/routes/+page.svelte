<script>
  import { createDecks, drawCards, shuffleDecks } from '$lib/deckAPI'

  let deckId = null;
  let remainingCards = 0;
  let currentCard = null;
  let drawnCards = [];
  let isLoading = false;
  let error = null;
  let showDeckIdTooltip = false;

  // Создание новой колоды
  async function createNewDeck() {
    isLoading = true;
    error = null;
    try {
      const data = await createDecks();
      
      if (data.success) {
        deckId = data.deck_id;
        remainingCards = data.remaining;
        drawnCards = [];
        currentCard = null;
      } else {
        error = 'Не удалось создать колоду';
      }
    } catch (err) {
      error = 'Ошибка сети: ' + err.message;
    }
    isLoading = false;
  }

  // Вытягивание карты
  async function drawCard() {
    if (!deckId || remainingCards === 0) return;
    
    isLoading = true;
    error = null;
    try {
      const data = await drawCards(deckId, 1);
      
      if (data.success && data.cards.length > 0) {
        currentCard = data.cards[0];
        remainingCards = data.remaining;
        drawnCards = [currentCard, ...drawnCards];
      } else {
        error = 'Не удалось вытянуть карту';
      }
    } catch (err) {
      error = 'Ошибка сети: ' + err.message;
    }
    isLoading = false;
  }

  // Перетасовка колоды
  async function shuffleDeck() {
    if (!deckId) return;
    
    isLoading = true;
    error = null;
    try {
      const data = await shuffleDecks(deckId);
      
      if (data.success) {
        remainingCards = data.remaining;
        drawnCards = [];
        currentCard = null;
      } else {
        error = 'Не удалось перетасовать колоду';
      }
    } catch (err) {
      error = 'Ошибка сети: ' + err.message;
    }
    isLoading = false;
  }

</script>

<svelte:head>
    <title>Deck Of Cards</title>
</svelte:head>

<main>
    <h1>🃏Deck Of Cards</h1>
    <div class="container">
        <!-- Статус и управление -->
        <div class="controls">
            <div class="status">
                {#if deckId}
                    <p>Колода: 
                      <strong 
                        class="deck-id" 
                        on:mouseenter={() => showDeckIdTooltip = true}
                        on:mouseleave={() => showDeckIdTooltip = false}
                      >
                        {deckId.slice(0, 8)}...</strong></p>
                    <p>Осталось карт: <strong>{remainingCards}</strong></p>
                {:else}
                    <p>Колода: ...</p>
                    <p>Осталось карт: ...</p>
                {/if}
                {#if showDeckIdTooltip}
                  <div class="tooltip">
                    ID: {deckId}
                  </div>
                {/if}
            </div>
            <div class="buttons">
                <button on:click={drawCard} disabled={isLoading || !deckId || remainingCards === 0}>
                {isLoading ? 'Загрузка...' : 'Вытянуть'}
                </button>
                <button on:click={shuffleDeck} disabled={isLoading || !deckId}>
                {isLoading ? 'Загрузка...' : 'Перетасовать'}
                </button>
                <button on:click={createNewDeck} disabled={isLoading}>
                {isLoading ? 'Загрузка...' : (deckId ? 'Пересоздать' : 'Создать колоду')}
                </button>
            </div>
        </div>
        <!-- Сообщение об ошибках -->
        {#if error}
            <div class="error">
                ⚠️ {error}
            </div>
        {/if}
        <!-- Текущая карта -->
        {#if currentCard}
            <div class="current-card">
                <h2>Текущая карта: </h2>
                <div class="card-display">
                    <img 
                    src={currentCard.image} 
                    alt='{currentCard.value} of {currentCard.suit}' 
                    class="card-image"
                    >
                </div>
                <div class="card-info">
                    <p><strong>{currentCard.value} of {currentCard.suit}</strong></p>
                    <p class="card-code">Код: {currentCard.code}</p>
                </div>
            </div>
        {/if}
        <!-- История вытянутых карт -->
            {#if drawnCards.length > 0}
                <div class="history">
                    <h2>История карт ({drawnCards.length})</h2>
                    <div class="cards-grid">
                        {#each drawnCards as card, index}
                            <div class="history-card">
                                <img 
                                src={card.image} 
                                alt="{card.value} of {card.suit}" 
                                class="card-image small"
                                title="{card.value} of {card.suit}"
                                >
                            </div>
                        {/each}
                    </div>
                </div>
            {:else if deckId && !isLoading}
            <div class="empty-state">
                <p>🎲Нажмите "Вытянуть", чтобы взять одну из карт!</p>
            </div>
            {:else if !isLoading}
            <div class="empty-state">
                <p>🎴Чтобы Нажмите "Создать колоду", чтобы подготовить карты!</p>
            </div>
            {/if}
        <!-- Состояние загрузки -->
        {#if isLoading && !currentCard}
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        {/if}
    </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #00fff7 0%, #00ff55 100%);
    min-height: 100vh;
    color: #333;
  }

  main {
    padding: 20px;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    min-height: 300px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 2em;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    max-height: 15vh;
  }

  .status {
    flex: 1;
  }

  .status p {
    margin: 5px 0;
    font-size: 1.1em;
  }

  .buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  button {
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    background: #3498db;
    color: white;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  button:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .error {
    background: #e74c3c;
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: center;
    font-weight: 600;
  }

  .current-card {
    text-align: center;
    margin: 30px 0;
    padding: 20px;
    background: #ecf0f1;
    border-radius: 10px;
  }

  .card-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
  }

  .card-image {
    width: 200px;
    height: 280px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  .card-image:hover {
    transform: scale(1.05);
  }

  .card-image.small {
    width: 80px;
    height: 112px;
    border-radius: 4px;
  }

  .card-info {
    text-align: left;
  }

  .card-info p {
    margin: 10px 0;
    font-size: 1.2em;
  }

  .card-code {
    color: #7f8c8d;
    font-size: 1em !important;
  }

  .history {
    margin-top: 40px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 10px;
    margin-top: 20px;
  }

  .history-card {
    text-align: center;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
    font-size: 1.2em;
  }

  .loading {
    text-align: center;
    padding: 19px;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 767px) {
    .container {
      padding: 15px;
      margin: 10px;
    }

    .controls {
      flex-direction: column;
      text-align: center;
    }

    .buttons {
      justify-content: center;
    }

    .card-display {
      flex-direction: column;
    }

    .card-info {
      text-align: center;
    }

    button {
      font-size: 0.8em;
    }

    .status {
      font-size: 0.9em;
    }

    .card-image {
      width: 150px;
      height: 210px;
    }

    .card-image.small {
      width: 50px;
      height: 70px;
    }
    p {
      font-size: 0.8em;
    }
  }

  @media (max-width: 560px) {
    .loading {
      margin-bottom: -5px;
    }

    button {
      font-size: 0.6em;
      padding: 10px;
    }

    .status {
      font-size: 0.8em;
    }

    p {
      font-size: 0.5em;
    }
  }

  @media (max-width: 400px) {
    .loading {
      margin-bottom: 8px;
    }

    button {
      font-size: 0.5em;
      padding: 10px;
    }

    .status {
      font-size: 0.6em;
    }

    p {
      font-size: 0.4em;
    }
  }
  
  .deck-id {
  cursor: pointer;
  text-decoration: underline;
  color: #3498db;
  }

  .tooltip {
    position: absolute;
    background: black;
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    margin-left: 10px;
    top: 20%;
  }
</style>