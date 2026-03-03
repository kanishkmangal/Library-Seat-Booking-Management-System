import Seat from '../models/Seat.model.js';
import Booking from '../models/Booking.model.js';

export const getAllSeats = async (req, res, next) => {
  try {
    const { section, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (section) {
      query.section = section;
    }

    if (status) {
      query.status = status;
    }

    const total = await Seat.countDocuments(query);
    const seats = await Seat.find(query)
      .sort({ seatNumber: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      seats,
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

export const getSeatLayout = async (req, res, next) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();

    // Get all seats
    const seats = await Seat.find({ isActive: true }).sort({ row: 1, column: 1 });

    // Get bookings for the date
    const bookings = await Booking.find({
      status: 'active',
      startDate: { $lte: queryDate },
      endDate: { $gte: queryDate },
    }).populate('seats.seat');

    const bookedSeatIds = new Set();
    bookings.forEach((booking) => {
      booking.seats.forEach((item) => {
        if (item.seat && item.seat._id) {
          bookedSeatIds.add(item.seat._id.toString());
        }
      });
    });

    // Map seats with availability status
    const seatLayout = seats.map((seat) => {
      const isBooked = bookedSeatIds.has(seat._id.toString());
      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        section: seat.section,
        genderType: seat.genderType,
        status: isBooked ? 'booked' : seat.status,
      };
    });

    return res.status(200).json({ seatLayout, date: queryDate });
  } catch (error) {
    next(error);
  }
};

export const getSeatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);

    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    res.json({ seat });
  } catch (error) {
    next(error);
  }
};

