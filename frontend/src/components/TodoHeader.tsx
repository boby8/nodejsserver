interface TodoHeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export const TodoHeader = ({ userEmail, onLogout }: TodoHeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      <h1>Todo App</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ color: "#666" }}>{userEmail}</span>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
};
