import { useState, useCallback } from "react";
import { todoApi } from "../services/api";
import type { Todo, TodosResponse } from "../types/todo";

export const useTodos = (page: number, limit = 10) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: TodosResponse = await todoApi.getAll(page, limit);
      setTodos(data.todos);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const createTodo = useCallback(
    async (title: string) => {
      await todoApi.create({ title });
      await loadTodos();
    },
    [loadTodos]
  );

  const updateTodo = useCallback(
    async (id: number, data: { title?: string; completed?: boolean }) => {
      const updated = await todoApi.update(id, data);
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    },
    []
  );

  const deleteTodo = useCallback(async (id: number) => {
    await todoApi.delete(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return {
    todos,
    loading,
    error,
    pagination,
    loadTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
};
