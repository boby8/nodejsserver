import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { todoApi } from "./services/api";
import type { Todo } from "./types/todo";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import "./App.css";

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      setError(null);
      const todo = await todoApi.create({ title: newTodoTitle.trim() });
      setTodos([todo, ...todos]);
      setNewTodoTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      setError(null);
      const updated = await todoApi.update(id, { completed: !completed });
      setTodos(todos.map((todo) => (todo.id === id ? updated : todo)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    try {
      setError(null);
      const updated = await todoApi.update(id, { title: editTitle.trim() });
      setTodos(todos.map((todo) => (todo.id === id ? updated : todo)));
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      setError(null);
      await todoApi.delete(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  };

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        {showSignup ? <Signup /> : <Login />}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          {showSignup ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setShowSignup(false)}
                className="btn btn-secondary"
                style={{ marginLeft: "0.5rem" }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setShowSignup(true)}
                className="btn btn-secondary"
                style={{ marginLeft: "0.5rem" }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
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
          <span style={{ color: "#666" }}>{user.email}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="todo-form">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Enter a new todo..."
          className="todo-input"
        />
        <button type="submit" className="btn btn-primary">
          Add Todo
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : todos.length === 0 ? (
        <div className="empty">No todos yet. Create one above!</div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id, todo.completed)}
                className="todo-checkbox"
              />
              {editingId === todo.id ? (
                <div className="todo-edit">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(todo.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(todo.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    autoFocus
                    className="todo-edit-input"
                  />
                  <button
                    onClick={() => handleSaveEdit(todo.id)}
                    className="btn btn-small"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-small btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="todo-title"
                    onDoubleClick={() => handleStartEdit(todo)}
                  >
                    {todo.title}
                  </span>
                  <div className="todo-actions">
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="btn btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
