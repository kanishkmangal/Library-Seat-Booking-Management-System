import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingAPI } from '../../services/api';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await bookingAPI.getAll();
      const foundBooking = response.data.bookings.find((b) => b.bookingId === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Booking not found</p>
        <Link to="/booking/history" className="text-blue-600 dark:text-blue-400 hover:underline">
          Go to Booking History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400">Your seat reservation is confirmed</p>
        </div>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-semibold mb-2">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="font-semibold">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                <span className="font-semibold">
                  {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                <span className="font-semibold">
                  {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-semibold">{booking.durationMonths} month(s)</span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-semibold mb-2">Seats</h2>
            <div className="flex flex-wrap gap-2">
              {booking.seats.filter(item => item.seat).map((item) => (
                <div key={item.seat._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg font-medium text-sm">
                      Seat {item.seat.seatNumber} ({item.seat.genderType?.toUpperCase() || item.seat.section})
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium">Passenger:</span> {item.name}</p>
                    <p><span className="font-medium">Father:</span> {item.fatherName}</p>
                    <p><span className="font-medium">Contact:</span> {item.contactNumber}</p>
                    <p><span className="font-medium">Exam:</span> {item.examPreparingFor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              to="/booking/history"
              className="flex-1 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Bookings
            </Link>
            <Link
              to="/booking"
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-center rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Book Another Seat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

