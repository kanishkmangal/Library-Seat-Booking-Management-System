import { calculateEndDate, calculateAmount } from '../backend/services/booking.service.js';

// Mocking the parts of createBooking that failed
const testCreateBookingLogic = (seatIds, startDate, durationMonths) => {
    try {
        const start = new Date(startDate);
        const end = calculateEndDate(start, durationMonths);
        const amount = calculateAmount(seatIds.length, durationMonths);
        const bookingData = {
            bookingId: 'MOCK-ID',
            seats: seatIds,
            startDate: start,
            endDate: end,
            durationMonths,
            totalAmount: amount,
        };
        console.log('Booking Logic Success:', bookingData);
    } catch (err) {
        console.error('Booking Logic Failure:', err);
    }
};

testCreateBookingLogic(['seat1'], '2026-02-22', 1);
