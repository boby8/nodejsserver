import { useState, useCallback } from "react";
import { cardApi } from "../services/cardApi";
import type { Card, CardsResponse } from "../types/card";

export const useCards = (page: number, limit = 10) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: CardsResponse = await cardApi.getAll(page, limit);
      setCards(data.cards);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createCard = useCallback(
    async (title: string, description?: string) => {
      const card = await cardApi.create({ title, description });
      setCards((prev) => [card, ...prev]);
      await loadCards();
    },
    [loadCards]
  );

  const updateCard = useCallback(
    async (id: number, data: { title?: string; description?: string }) => {
      const updated = await cardApi.update(id, data);
      setCards((prev) =>
        prev.map((card) => (card.id === id ? updated : card))
      );
    },
    []
  );

  const deleteCard = useCallback(async (id: number) => {
    await cardApi.delete(id);
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  return {
    cards,
    loading,
    error,
    pagination,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
  };
};
