import Booking from '../models/Booking.model.js';
import Seat from '../models/Seat.model.js';

export const generateBookingId = () => {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

export const checkSeatAvailability = async (seatIds, startDate, endDate) => {
  const overlappingBookings = await Booking.find({
    status: 'active',
    seats: { $in: seatIds },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  });

  if (overlappingBookings.length > 0) {
    return {
      available: false,
      message: 'One or more seats are already booked for the selected dates',
    };
  }

  const seats = await Seat.find({ _id: { $in: seatIds } });
  const lockedSeats = seats.filter((seat) => seat.status === 'locked');

  if (lockedSeats.length > 0) {
    return {
      available: false,
      message: 'One or more selected seats are locked',
    };
  }

  return { available: true };
};

export const calculateEndDate = (startDate, durationMonths) => {
  const start = new Date(startDate);
  const daysToAdd = durationMonths * 30;
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + daysToAdd);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

export const calculateAmount = (seatCount, durationMonths) => {
  const basePricePerMonth = 500; // Base price per seat per 30 days
  return seatCount * durationMonths * basePricePerMonth;
};

