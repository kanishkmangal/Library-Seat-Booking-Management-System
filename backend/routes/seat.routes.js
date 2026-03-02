import express from 'express';
import {
  getAllSeats,
  getSeatLayout,
  getSeatById,
} from '../controllers/seat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/layout', getSeatLayout);
router.get('/:id', getSeatById);
router.get('/', authenticate, getAllSeats);

export default router;

