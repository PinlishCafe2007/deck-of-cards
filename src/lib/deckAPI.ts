import type { DeckResponse, Card } from './types/deck';

const API_BASE = 'https://deckofcardsapi.com/api/deck';

export async function createDecks(): Promise<DeckResponse> {
  const response = await fetch(`${API_BASE}/new/?deck_count=1`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function drawCards(deckId: string, count: number = 1): Promise<DeckResponse> {
  const response = await fetch(`${API_BASE}/${deckId}/draw/?count=${count}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function shuffleDecks(deckId: string): Promise<DeckResponse> {
  const response = await fetch(`${API_BASE}/${deckId}/shuffle/`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}