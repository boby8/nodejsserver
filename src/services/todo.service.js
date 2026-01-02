import { pool } from "../config/db.js";

export const createTodo = async (data) => {
  const result = await pool.query(
    "INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *",
    [data.title, data.completed || false]
  );
  return result.rows[0];
};

export const getTodos = async () => {
  const result = await pool.query("SELECT * FROM todos ORDER BY created_at DESC");
  return result.rows;
};

export const getTodoById = async (id) => {
  const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Todo not found");
  }
  return result.rows[0];
};

export const updateTodo = async (id, data) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.completed !== undefined) {
    updates.push(`completed = $${paramCount++}`);
    values.push(data.completed);
  }

  if (updates.length === 0) {
    return await getTodoById(id);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error("Todo not found");
  }

  return result.rows[0];
};

export const deleteTodo = async (id) => {
  const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) {
    throw new Error("Todo not found");
  }
};

