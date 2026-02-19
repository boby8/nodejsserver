import { useEffect } from "react";
import { useCards } from "../hooks/useCards";
import { CardForm } from "../components/CardForm";
import { CardList } from "../components/CardList";
import { Pagination } from "../components/Pagination";
import { useState } from "react";
import "./CardsPage.css";

interface CardsPageProps {
  userEmail: string;
  onLogout: () => void;
}

export const CardsPage = ({ userEmail, onLogout }: CardsPageProps) => {
  const [page, setPage] = useState(1);

  const {
    cards,
    loading,
    error,
    pagination,
    loadCards,
    createCard,
    updateCard,
    deleteCard,
  } = useCards(page);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleCreate = async (title: string, description?: string) => {
    await createCard(title, description);
    setPage(1);
  };

  const handleUpdate = async (
    id: number,
    title: string,
    description?: string
  ) => {
    await updateCard(id, { title, description });
  };

  const handleDelete = async (id: number) => {
    await deleteCard(id);
  };

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Cards</h1>
        <div className="cards-user">
          <span>{userEmail}</span>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <CardForm onSubmit={handleCreate} isLoading={loading} />

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : (
        <>
          <CardList
            cards={cards}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
