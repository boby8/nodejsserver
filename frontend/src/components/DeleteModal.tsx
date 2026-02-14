interface DeleteModalProps {
  isOpen: boolean;
  todoTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteModal = ({
  isOpen,
  todoTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Todo</h3>
        <p>
          Are you sure you want to delete <strong>"{todoTitle}"</strong>? This
          action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
