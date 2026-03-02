import Booking from '../models/Booking.model.js';
import Seat from '../models/Seat.model.js';
import {
  generateBookingId,
  checkSeatAvailability,
  calculateEndDate,
  calculateAmount,
} from '../services/booking.service.js';

export const createBooking = async (req, res, next) => {
  try {
    const { seatIds, startDate, durationMonths } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'At least one seat must be selected' });
    }

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (![1, 2, 3].includes(durationMonths)) {
      return res.status(400).json({ message: 'Duration must be 1, 2, or 3 months' });
    }

    const end = calculateEndDate(start, durationMonths);

    // Check seat availability
    const availability = await checkSeatAvailability(seatIds, start, end);
    if (!availability.available) {
      return res.status(400).json({ message: availability.message });
    }

    // Create booking
    const bookingId = generateBookingId();
    const totalAmount = calculateAmount(seatIds.length, durationMonths);

    const booking = new Booking({
      bookingId,
      user: userId,
      seats: seatIds,
      startDate: start,
      endDate: end,
      durationMonths,
      totalAmount,
    });

    await booking.save();

    // Populate seat details
    await booking.populate('seats', 'seatNumber row column section');

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('seats', 'seatNumber row column section')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, user: userId }).populate(
      'seats',
      'seatNumber row column section'
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, user: userId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

export const lockSeats = async (req, res, next) => {
  try {
    const { seatIds, startDate, durationMonths } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one seat must be selected'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (![1, 2, 3].includes(durationMonths)) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be 1, 2, or 3 months'
      });
    }

    const end = calculateEndDate(start, durationMonths);

    // Check seat availability
    const availability = await checkSeatAvailability(seatIds, start, end);
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: availability.message
      });
    }

    // Seats are available (locking is handled by the booking creation)
    res.json({
      success: true,
      message: 'Seats are available for booking'
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

