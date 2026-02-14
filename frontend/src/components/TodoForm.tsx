import { useState } from "react";
import type { FormEvent } from "react";

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>;
  isLoading?: boolean;
}

export const TodoForm = ({ onSubmit, isLoading = false }: TodoFormProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new todo..."
        className="todo-input"
        disabled={isLoading}
      />
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        Add Todo
      </button>
    </form>
  );
};
