// Функции для работы с API колоды карт
const BASE_URL = "https://deckofcardsapi.com/api/deck";

// Создать новую колоду
export async function createDecks()
{
    const response = await fetch(`${BASE_URL}/new/shuffle/`);
    if (!response.ok) throw new Error('Ошибка создания колоды');
    return response.json();
}

// Вытягивание карты
export async function drawCards(deckId, count = 1)
{
    const response = await fetch(`${BASE_URL}/${deckId}/draw/?count=${count}`);
    if (!response.ok) throw new Error('Ошибка вытягивания карт');
    return response.json();
}

// Перетасовка колоды
export async function shuffleDecks(deckId)
{
    const response = await fetch(`${BASE_URL}/${deckId}/shuffle/`);
    if (!response.ok) throw new Error('Ошибка перетасовки');
    return response.json();
}