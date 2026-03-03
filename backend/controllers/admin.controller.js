import Seat from '../models/Seat.model.js';
import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';

// Seat Management
export const createSeat = async (req, res, next) => {
  try {
    const { seatNumber, row, column, section, status } = req.body;

    const existingSeat = await Seat.findOne({ seatNumber });
    if (existingSeat) {
      return res.status(400).json({ message: 'Seat with this number already exists' });
    }

    const seat = new Seat({
      seatNumber,
      row,
      column,
      section,
      status: status || 'available',
    });

    await seat.save();
    res.status(201).json({ message: 'Seat created successfully', seat });
  } catch (error) {
    next(error);
  }
};

export const createMultipleSeats = async (req, res, next) => {
  try {
    const { seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Seats array is required' });
    }

    const createdSeats = [];
    const errors = [];

    for (const seatData of seats) {
      try {
        const existingSeat = await Seat.findOne({ seatNumber: seatData.seatNumber });
        if (existingSeat) {
          errors.push({ seatNumber: seatData.seatNumber, error: 'Already exists' });
          continue;
        }

        const seat = new Seat(seatData);
        await seat.save();
        createdSeats.push(seat);
      } catch (error) {
        errors.push({ seatNumber: seatData.seatNumber, error: error.message });
      }
    }

    res.status(201).json({
      message: `Created ${createdSeats.length} seats`,
      createdSeats,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSeat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    const seat = await Seat.findById(id);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (status !== undefined) {
      seat.status = status;
    }

    if (isActive !== undefined) {
      seat.isActive = isActive;
    }

    await seat.save();
    res.json({ message: 'Seat updated successfully', seat });
  } catch (error) {
    next(error);
  }
};

export const deleteSeat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findById(id);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    // Check if seat has active bookings
    const activeBookings = await Booking.find({
      status: 'active',
      seats: id,
      endDate: { $gte: new Date() },
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete seat with active bookings',
      });
    }

    await Seat.findByIdAndDelete(id);
    res.json({ message: 'Seat deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Booking Management
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, startDate, endDate, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.$or = [];
      if (startDate) {
        query.$or.push({ startDate: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        query.$or.push({ endDate: { $lte: new Date(endDate) } });
      }
    }

    if (userId) {
      query.user = userId;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('seats.seat', 'seatNumber genderType row section')
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

export const cancelBookingAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('seats.seat');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// Reports
export const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      status: 'active',
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    };

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('seats.seat', 'seatNumber genderType row section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate stats for the WHOLE month (without skip/limit)
    // This could be heavy, but usually reports need totals.
    // For now, I'll just return the paginated list and use the total count for pagination.
    // If the user needs totalRevenue for the whole month, I should aggregate it.

    // Aggregation for totals
    const stats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSeats: { $sum: { $size: '$seats' } },
        },
      },
    ]);

    res.json({
      month: targetMonth,
      year: targetYear,
      totalBookings: total,
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalSeatsBooked: stats[0]?.totalSeats || 0,
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

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSeats = await Seat.countDocuments({ isActive: true });
    const availableSeats = await Seat.countDocuments({ isActive: true, status: 'available' });
    const lockedSeats = await Seat.countDocuments({ status: 'locked' });
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const totalBookings = await Booking.countDocuments();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'active',
          createdAt: { $gte: currentMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Calculate occupancy rate
    const bookedSeatsCount = await Booking.aggregate([
      {
        $match: {
          status: 'active',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      },
      {
        $unwind: '$seats',
      },
      {
        $group: {
          _id: '$seats.seat',
        },
      },
      {
        $count: 'count',
      },
    ]);

    const currentlyBooked = bookedSeatsCount[0]?.count || 0;
    const occupancyRate = totalSeats > 0 ? ((currentlyBooked / totalSeats) * 100).toFixed(1) : 0;

    res.json({
      totalUsers,
      totalSeats,
      availableSeats,
      lockedSeats,
      activeBookings,
      totalBookings,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      currentlyBooked,
      occupancyRate: parseFloat(occupancyRate),
    });
  } catch (error) {
    next(error);
  }
};

export const forceReleaseSeat = async (req, res, next) => {
  try {
    const { seatId } = req.body;

    if (!seatId) {
      return res.status(400).json({ message: 'Seat ID is required' });
    }

    const seat = await Seat.findById(seatId);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    // Cancel all active bookings for this seat
    const activeBookings = await Booking.find({
      status: 'active',
      'seats.seat': seatId,
    });

    for (const booking of activeBookings) {
      booking.status = 'cancelled';
      await booking.save();
    }

    // Unlock the seat
    seat.status = 'available';
    await seat.save();

    res.json({
      message: 'Seat force-released successfully',
      cancelledBookings: activeBookings.length,
      seat,
    });
  } catch (error) {
    next(error);
  }
};

