<script>
  import { createDecks, drawCards, shuffleDecks } from '$lib/deckAPI'
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import { onMount } from 'svelte';

  let deckId = null;
  let remainingCards = 0;
  let currentCard = null;
  let drawnCards = [];
  let isLoading = false;
  let error = null;
  let showDeckIdTooltip = false;
  let isDrawingCard = false;
  let isShuffling = false;
  let isRecreating = false;

  // Создание новой колоды
  async function createNewDeck() {
    if (deckId) {
      // Если колода уже существует - это пересоздание
      isRecreating = true;
    } else {
      isLoading = true;
    }
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
    isRecreating = false;
  }

  // Вытягивание карты
  async function drawCard() {
    if (!deckId || remainingCards === 0) return;
    
    isDrawingCard = true;
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
    isDrawingCard = false;
  }

  // Перетасовка колоды
  async function shuffleDeck() {
    if (!deckId) return;
    
    isShuffling = true;
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
    isShuffling = false;
  }

  onMount(() => {
    // Тултипы для кнопок
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
        <!-- Статус и управление -->
        <div class="controls">
            <div class="status">
                {#if deckId}
                    <p class="status-item">Колода: 
                      <strong 
                        class="deck-id" 
                        on:mouseenter={() => showDeckIdTooltip = true}
                        on:mouseleave={() => showDeckIdTooltip = false}
                      >
                        {deckId.slice(0, 8)}...
                      </strong>
                    </p>
                    <p class="status-item">Осталось карт: <strong>{remainingCards}</strong></p>
                    {#if showDeckIdTooltip}
                      <div class="tooltip">
                        {deckId}
                      </div>
                    {/if}
                {:else}
                    <p class="status-item">Колода: ...</p>
                    <p class="status-item">Осталось карт: ...</p>
                {/if}
            </div>
            <div class="buttons">
                <button id="create-btn" class="btn" on:click={createNewDeck} disabled={isLoading || isRecreating}>
                  <span class="btn-text">
                    {#if isLoading}
                      Загрузка...
                    {:else if isRecreating}
                      Пересоздание...
                    {:else}
                      {deckId ? 'Пересоздать' : 'Создать колоду'}
                    {/if}
                  </span>
                </button>
                <button id="draw-btn" class="btn" on:click={drawCard} disabled={isDrawingCard || !deckId || remainingCards === 0}>
                  <span class="btn-text">
                    {isDrawingCard ? 'Вытягиваем...' : 'Вытянуть'}
                  </span>
                </button>
                <button id="shuffle-btn" class="btn" on:click={shuffleDeck} disabled={isShuffling || !deckId}>
                  <span class="btn-text">
                    {isShuffling ? 'Перетасовка...' : 'Перетасовать'}
                  </span>
                </button>
            </div>
        </div>

        <!-- Сообщение об ошибках -->
        {#if error}
            <div class="error">
                ⚠️ {error}
            </div>
        {/if}

        <!-- Основной контент показывается только когда есть колода -->
        {#if deckId}
            <div class="content">
                <!-- Текущая карта -->
                <div class="current-card-section">
                    <h2>Текущая карта:</h2>
                    <div class="current-card">
                        {#if isRecreating}
                            <div class="card-loading">
                                <div class="spinner large"></div>
                                <p>Пересоздаем колоду...</p>
                            </div>
                        {:else if isShuffling}
                            <div class="card-loading">
                                <div class="spinner large"></div>
                                <p>Перетасовываем колоду...</p>
                            </div>
                        {:else if isDrawingCard}
                            <div class="card-loading">
                                <div class="spinner large"></div>
                                <p>Вытягиваем карту...</p>
                            </div>
                        {:else if currentCard}
                            <div class="card-with-info">
                                <img 
                                  src={currentCard.image} 
                                  alt="{currentCard.value} of {currentCard.suit}" 
                                  class="card-image main hover-effect"
                                >
                                <div class="card-info">
                                    <p class="card-name"><strong>{currentCard.value} of {currentCard.suit}</strong></p>
                                    <p class="card-code">Код: {currentCard.code}</p>
                                </div>
                            </div>
                        {:else}
                            <div class="no-card">
                                <p>Карта не вытянута</p>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- История вытянутых карт -->
                <div class="history-section">
                    <h2>История карт ({drawnCards.length})</h2>
                    <div class="cards-grid-container">
                        <div class="cards-grid">
                            {#each drawnCards as card, index}
                                <div class="history-card">
                                    <img 
                                      src={card.image} 
                                      alt="{card.value} of {card.suit}" 
                                      class="card-image small hover-effect"
                                      title="{card.value} of {card.suit}"
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {:else if !isLoading}
            <!-- Пустое состояние когда колоды нет -->
            <div class="empty-state">
                <p>🎴 Нажмите "Создать колоду", чтобы начать!</p>
            </div>
        {/if}

        <!-- Состояние загрузки только для создания первой колоды -->
        {#if isLoading && !deckId}
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
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 500px;
  }

  h1 {
    text-align: center;
    color: #2c3e50;
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
    background: #f8f9fa;
    border-radius: 12px;
    flex-wrap: wrap;
  }

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

  .buttons {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .btn {
    position: relative;
    padding: 14px 0;
    width: 160px;
    height: 52px;
    border: none;
    border-radius: 10px;
    background: #3498db;
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

  .btn-text {
    display: inline-block;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  .btn:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .error {
    background: #e74c3c;
    color: white;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: center;
    font-weight: 600;
    font-size: 1em;
    box-sizing: border-box;
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
    background: #ecf0f1;
    border-radius: 12px;
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

  .no-card {
    text-align: center;
    color: #7f8c8d;
    font-size: 1.2em;
  }

  .card-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    height: 100%;
  }

  .card-image {
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
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

  .hover-effect:hover {
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
    color: #2c3e50;
  }

  .card-code {
    color: #7f8c8d;
    font-size: 1.1em;
    margin: 0;
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
    color: #7f8c8d;
    font-size: 1.3em;
    line-height: 1.5;
    background: #f8f9fa;
    border-radius: 12px;
    margin: 20px 0;
  }

  .loading {
    text-align: center;
    padding: 60px;
  }

  .spinner {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  .spinner.large {
    width: 80px;
    height: 80px;
    border-width: 6px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .deck-id {
    cursor: pointer;
    text-decoration: underline;
    color: #3498db;
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    top: -27px;
    left: 15%;
    transform: translateX(-50%);
    background: #3f3f3f;
    color: white;
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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
    border-top: 8px solid #2c3e50;
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
    
    .card-image.main {
      width: 200px;
      height: 280px;
    }
    
    .card-image.small {
      width: 70px;
      height: 98px;
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

    .btn {
      width: 150px;
      height: 50px;
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

    .card-image.main {
      width: 180px;
      height: 252px;
    }

    .card-image.small {
      width: 65px;
      height: 91px;
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

    .status {
      min-width: auto;
      text-align: center;
    }

    .buttons {
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      width: 140px;
      height: 48px;
      font-size: 0.95em;
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

    .card-image.main {
      width: 160px;
      height: 224px;
    }

    .card-info {
      text-align: left;
    }

    .card-name {
      font-size: 1.3em;
    }

    .card-image.small {
      width: 75px;
      height: 105px;
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

    .status {
      min-width: auto;
      text-align: center;
    }

    .buttons {
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      width: 140px;
      height: 48px;
      font-size: 0.95em;
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

    .card-image.main {
      width: 160px;
      height: 224px;
    }

    .card-info {
      text-align: left;
    }

    .card-name {
      font-size: 1.3em;
    }

    .card-image.small {
      width: 60px;
      height: 84px;
    }

    .empty-state {
      padding: 40px;
      font-size: 1.2em;
    }

    .tooltip {
      font-size: 13px;
      padding: 10px 14px;
      max-width: 250px;
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

    .status-item {
      font-size: 1em;
    }

    .buttons {
      gap: 8px;
    }

    .btn {
      width: 130px;
      height: 44px;
      font-size: 0.9em;
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

    .card-image.main {
      width: 140px;
      height: 196px;
    }

    .card-name {
      font-size: 1.2em;
    }

    .card-image.small {
      width: 70px;
      height: 98px;
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

    .status-item {
      font-size: 1em;
    }

    .buttons {
      gap: 8px;
    }

    .btn {
      width: 130px;
      height: 44px;
      font-size: 0.9em;
      border-radius: 8px;
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

    .card-info {
      text-align: center;
    }

    .cards-grid-container {
      min-height: 250px;
    }

    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      max-height: 250px;
    }

    .card-image.main {
      width: 140px;
      height: 196px;
    }

    .card-name {
      font-size: 1.2em;
    }

    .card-image.small {
      width: 55px;
      height: 77px;
    }

    .empty-state {
      padding: 30px;
      font-size: 1.1em;
    }

    .error {
      padding: 14px;
      font-size: 0.95em;
    }

    .history-section h2 {
      font-size: 1.3em;
    }

    .tooltip {
      font-size: 12px;
      padding: 8px 12px;
      max-width: 200px;
      top: -70px;
    }
  }

  /* Очень маленькие телефоны */
  @media (max-width: 360px) {
    .container {
      margin: 0 5px;
    }

    .btn {
      width: 120px;
      height: 42px;
      font-size: 0.85em;
    }

    .buttons {
      gap: 6px;
    }

    .card-image.main {
      width: 120px;
      height: 168px;
    }

    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
      max-height: 200px;
    }

    .card-image.small {
      width: 50px;
      height: 70px;
    }

    h1 {
      font-size: 1.6em;
    }
  }
</style> 