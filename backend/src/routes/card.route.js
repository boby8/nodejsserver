import { Router } from "express";
import {
  createCard,
  getCards,
  getCardById,
  updateCard,
  deleteCard,
} from "../controllers/card.controller.js";

const router = Router();

router.get("/list", getCards);
router.get("/get/:id", getCardById);
router.post("/persist", createCard);
router.put("/update", updateCard);
router.delete("/delete", deleteCard);

export default router;
