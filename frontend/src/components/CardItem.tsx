import { useState } from "react";
import type { Card } from "../types/card";
import { DeleteModal } from "./DeleteModal";

interface CardItemProps {
  card: Card;
  onUpdate: (id: number, title: string, description?: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const CardItem = ({ card, onUpdate, onDelete }: CardItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setIsEditing(false);
      setEditTitle(card.title);
      setEditDescription(card.description);
      return;
    }

    await onUpdate(card.id, editTitle.trim(), editDescription.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(card.title);
    setEditDescription(card.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fn();
    }
    if (e.key === "Escape") handleCancel();
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(card.id);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DeleteModal
        isOpen={showDeleteModal}
        todoTitle={card.title}
        itemLabel="Card"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
      <div className="card-item">
        {isEditing ? (
          <div className="card-edit">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSave)}
              autoFocus
              className="card-edit-input"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSave)}
              className="card-edit-textarea"
              rows={2}
            />
            <div className="card-edit-actions">
              <button onClick={handleSave} className="btn btn-small">
                Save
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-small btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="card-title">{card.title}</h3>
            {card.description && (
              <p className="card-description">{card.description}</p>
            )}
            <div className="card-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-small"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-small btn-danger"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
