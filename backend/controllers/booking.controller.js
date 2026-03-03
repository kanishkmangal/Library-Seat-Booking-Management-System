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
    const { seatDetails, startDate, durationMonths } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!seatDetails || !Array.isArray(seatDetails) || seatDetails.length === 0) {
      return res.status(400).json({ message: 'At least one seat must be selected' });
    }

    const seatIds = seatDetails.map(d => d.seatId);

    // ... validation remains similar ...
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
      seats: seatDetails.map(d => ({
        seat: d.seatId,
        name: d.name,
        fatherName: d.fatherName,
        contactNumber: d.contactNumber,
        address: d.address
      })),
      startDate: start,
      endDate: end,
      durationMonths,
      totalAmount,
    });

    await booking.save();

    // Populate seat details
    await booking.populate('seats.seat', 'seatNumber row column section genderType');

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('seats.seat', 'seatNumber row column section genderType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on ID type (hex = _id, otherwise bookingId)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId ? { _id: id } : { bookingId: id };

    const booking = await Booking.findOne(query)
      .populate('user', 'name email')
      .populate('seats.seat', 'seatNumber genderType row section');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: Only admin or the owner can view
    if (userRole !== 'admin' && booking.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view this booking' });
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

