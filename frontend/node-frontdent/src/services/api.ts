import type { Todo, CreateTodoData, UpdateTodoData } from "../types/todo";

const API_BASE_URL = "http://localhost:4000/todos";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const todoApi = {
  async getAll(): Promise<Todo[]> {
    const response = await fetch(API_BASE_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  async getById(id: number): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch todo");
    return response.json();
  },

  async create(data: CreateTodoData): Promise<Todo> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },

  async update(id: number, data: UpdateTodoData): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete todo");
  },
};
