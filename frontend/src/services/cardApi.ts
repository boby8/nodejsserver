import type {
  Card,
  CreateCardData,
  UpdateCardData,
  CardsResponse,
} from "../types/card";

const API_BASE_URL = "http://localhost:4000/cards";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const cardApi = {
  async getAll(page = 1, limit = 10): Promise<CardsResponse> {
    const response = await fetch(
      `${API_BASE_URL}/list?page=${page}&limit=${limit}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch cards");
    return response.json();
  },

  async getById(id: number): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/get/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch card");
    return response.json();
  },

  async create(data: CreateCardData): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/persist`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create card");
    return response.json();
  },

  async update(id: number, data: UpdateCardData): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Failed to update card");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Failed to delete card");
  },
};
