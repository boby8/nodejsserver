import type { Card } from "../types/card";
import { CardItem } from "./CardItem";

interface CardListProps {
  cards: Card[];
  onUpdate: (
    id: number,
    title: string,
    description?: string
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const CardList = ({
  cards,
  onUpdate,
  onDelete,
}: CardListProps) => {
  if (cards.length === 0) {
    return <div className="empty">No cards yet. Create one above!</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
