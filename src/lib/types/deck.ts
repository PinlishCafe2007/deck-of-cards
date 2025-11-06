export interface Card {
  code: string;
  image: string;
  value: string;
  suit: string;
}

export interface DeckResponse {
  success: boolean;
  deck_id: string;
  remaining: number;
  shuffled?: boolean;
  cards?: Card[];
}

export interface DeckState {
  deckId: string | null;
  remainingCards: number;
  currentCard: Card | null;
  drawnCards: Card[];
}