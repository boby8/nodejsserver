import { Router } from "express";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/todo.controller.js";

const router = Router();

// CREATE
router.post("/", createTodo);

// READ ALL
router.get("/", getTodos);

// READ ONE
router.get("/:id", getTodoById);

// UPDATE
router.put("/:id", updateTodo);

// DELETE
router.delete("/:id", deleteTodo);

export default router;

