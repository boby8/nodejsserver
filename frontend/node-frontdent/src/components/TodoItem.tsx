import { useState } from "react";
import type { Todo } from "../types/todo";

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

  return (
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
          <span className="todo-title" onDoubleClick={() => setIsEditing(true)}>
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
              onClick={() => onDelete(todo.id)}
              className="btn btn-small btn-danger"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
};
