import { useState, useRef } from "react";
import type { FormEvent } from "react";

interface CardFormProps {
  onSubmit: (title: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

const TITLE_MAX = 100;

export const CardForm = ({ onSubmit, isLoading = false }: CardFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
      setShowDescription(false);
    } catch {
      // Keep form data on error so user doesn't lose input
    } finally {
      setIsSubmitting(false);
      titleRef.current?.focus();
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="card-form card-form--elevated">
      <div className="card-form-fields">
        <label className="visually-hidden" htmlFor="card-title">
          Card title
        </label>
        <input
          ref={titleRef}
          id="card-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          placeholder="Card title..."
          className="card-input"
          disabled={disabled}
          maxLength={TITLE_MAX}
          autoComplete="off"
        />
        {title.length > 80 && (
          <span className="card-form-char-count">
            {title.length}/{TITLE_MAX}
          </span>
        )}

        {showDescription ? (
          <div className="card-form-description">
            <label className="visually-hidden" htmlFor="card-description">
              Description (optional)
            </label>
            <textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="card-textarea"
              rows={2}
              disabled={disabled}
              autoFocus
            />
            <button
              type="button"
              className="card-form-hide-desc"
              onClick={() => setShowDescription(false)}
            >
              Hide description
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="card-form-add-desc"
            onClick={() => setShowDescription(true)}
          >
            + Add description
          </button>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || !title.trim()}
      >
        {isSubmitting ? "Adding..." : "Add Card"}
      </button>
    </form>
  );
};
