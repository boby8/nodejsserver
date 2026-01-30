import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTodos } from "./hooks/useTodos";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AuthSwitch } from "./components/AuthSwitch";
import { TodoHeader } from "./components/TodoHeader";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { Pagination } from "./components/Pagination";
import "./App.css";

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [page, setPage] = useState(1);

  const {
    todos,
    loading,
    error,
    pagination,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  } = useTodos(page);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user, loadTodos]);

  const handleCreate = async (title: string) => {
    await createTodo(title);
    setPage(1);
  };

  const handleToggle = async (id: number, completed: boolean) => {
    await updateTodo(id, { completed: !completed });
  };

  const handleUpdate = async (id: number, title: string) => {
    await updateTodo(id, { title });
  };

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
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
        <AuthSwitch
          isSignup={showSignup}
          onToggle={() => setShowSignup(!showSignup)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <TodoHeader userEmail={user.email} onLogout={logout} />

      <TodoForm onSubmit={handleCreate} isLoading={loading} />

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <>
          <TodoList
            todos={todos}
            onToggle={handleToggle}
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
}

export default App;
