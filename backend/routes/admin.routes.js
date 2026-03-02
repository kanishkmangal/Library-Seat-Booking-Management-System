import express from 'express';
import {
  createSeat,
  createMultipleSeats,
  updateSeat,
  deleteSeat,
  getAllBookings,
  cancelBookingAdmin,
  getMonthlyReport,
  getDashboardStats,
  forceReleaseSeat,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Seat management
router.post('/seats', createSeat);
router.post('/seats/bulk', createMultipleSeats);
router.patch('/seats/:id', updateSeat);
router.delete('/seats/:id', deleteSeat);

// Booking management
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/cancel', cancelBookingAdmin);

// Reports
router.get('/reports/monthly', getMonthlyReport);
router.get('/dashboard/stats', getDashboardStats);

// Seat management
router.post('/seats/force-release', forceReleaseSeat);

export default router;

