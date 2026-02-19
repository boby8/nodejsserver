import * as cardService from "../services/card.service.js";

export const createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard(req.body);
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
};

export const getCards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
      return res.status(400).json({ error: "Page must be greater than 0" });
    }
    if (limit < 1 || limit > 100) {
      return res
        .status(400)
        .json({ error: "Limit must be between 1 and 100" });
    }

    const result = await cardService.getCards(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCardById = async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    res.json(card);
  } catch (err) {
    next(err);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { id, ...data } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Card id is required" });
    }
    const card = await cardService.updateCard(id, data);
    res.json(card);
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Card id is required" });
    }
    await cardService.deleteCard(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
