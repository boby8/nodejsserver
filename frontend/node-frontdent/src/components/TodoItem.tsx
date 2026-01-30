import { useState } from "react";
import type { Todo } from "../types/todo";
import { DeleteModal } from "./DeleteModal";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onUpdate: (id: number, title: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TodoItem = ({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setIsEditing(false);
      setEditTitle(todo.title);
      return;
    }

    await onUpdate(todo.id, editTitle.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
      setShowDeleteModal(false);
    } catch {
      // Error handling is done in parent
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <DeleteModal
        isOpen={showDeleteModal}
        todoTitle={todo.title}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
      <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, todo.completed)}
          className="todo-checkbox"
        />

        {isEditing ? (
          <div className="todo-edit">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="todo-edit-input"
            />
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
        ) : (
          <>
            <span
              className="todo-title"
              onDoubleClick={() => setIsEditing(true)}
            >
              {todo.title}
            </span>
            <div className="todo-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-small"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="btn btn-small btn-danger"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </li>
    </>
  );
};
