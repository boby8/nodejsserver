import { pool } from "../config/db.js";

export const createCard = async (data) => {
  const result = await pool.query(
    "INSERT INTO cards (title, description) VALUES ($1, $2) RETURNING *",
    [data.title, data.description || ""]
  );
  return result.rows[0];
};

export const getCards = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    "SELECT * FROM cards ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );

  const countResult = await pool.query("SELECT COUNT(*) FROM cards");
  const total = parseInt(countResult.rows[0].count);

  return {
    cards: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getCardById = async (id) => {
  const result = await pool.query("SELECT * FROM cards WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new Error("Card not found");
  }
  return result.rows[0];
};

export const updateCard = async (id, data) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }

  if (updates.length === 0) {
    return await getCardById(id);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await pool.query(
    `UPDATE cards SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error("Card not found");
  }

  return result.rows[0];
};

export const deleteCard = async (id) => {
  const result = await pool.query(
    "DELETE FROM cards WHERE id = $1 RETURNING id",
    [id]
  );
  if (result.rows.length === 0) {
    throw new Error("Card not found");
  }
};
