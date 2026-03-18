import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { seatAPI, bookingAPI } from '../../services/api';
import SeatGrid from '../../components/booking/SeatGrid';
import BottomSheet from '../../components/common/BottomSheet';

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationMonths, setDurationMonths] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSeatLayout();
  }, [selectedDate]);

  const loadSeatLayout = async () => {
    try {
      setLoading(true);
      const response = await seatAPI.getLayout(selectedDate);
      setSeats(response.data.seatLayout);
      setSelectedSeats([]);
      setError('');
    } catch (err) {
      setError('Failed to load seat layout');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      const response = await bookingAPI.create({
        seatIds: selectedSeats,
        startDate: selectedDate,
        durationMonths,
      });

      navigate(`/booking/confirmation/${response.data.booking.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = 500;
    return selectedSeats.length * durationMonths * basePrice;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book a Seat</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {loading && seats.length === 0 ? (
            <div className="text-center py-12">Loading seat layout...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <SeatGrid
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                date={selectedDate}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <BottomSheet 
            isOpen={selectedSeats.length > 0} 
            selectedCount={selectedSeats.length}
            totalAmount={calculateTotal()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Duration (Months)</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>1 Month (30 Days)</option>
                    <option value={2}>2 Months (60 Days)</option>
                    <option value={3}>3 Months (90 Days)</option>
                  </select>
                </div>

                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Selected Seats:</span>
                    <span className="font-semibold">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Duration:</span>
                    <span className="font-semibold">{durationMonths} month(s)</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || selectedSeats.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </BottomSheet>
        </div>
      </div>
    </div>
  );
};

export default Booking;

