export interface Card {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
}

export interface CardsResponse {
  cards: Card[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
