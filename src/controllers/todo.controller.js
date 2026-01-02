import * as todoService from "../services/todo.service.js";

// CREATE
export const createTodo = async (req, res, next) => {
  try {
    // TODO: validate input
    const todo = await todoService.createTodo(req.body);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
};

// READ ALL
export const getTodos = async (req, res, next) => {
  try {
    const todos = await todoService.getTodos();
    res.json(todos);
  } catch (err) {
    next(err);
  }
};

// READ ONE
export const getTodoById = async (req, res, next) => {
  try {
    const todo = await todoService.getTodoById(req.params.id);
    res.json(todo);
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateTodo = async (req, res, next) => {
  try {
    const todo = await todoService.updateTodo(req.params.id, req.body);
    res.json(todo);
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteTodo = async (req, res, next) => {
  try {
    await todoService.deleteTodo(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

