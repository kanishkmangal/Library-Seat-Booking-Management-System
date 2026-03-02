import { format } from 'date-fns';

const BookingSummary = ({
  selectedSeats,
  durationMonths,
  onDurationChange,
  onConfirm,
  loading,
  date,
}) => {
  const basePrice = 500;
  const total = selectedSeats.length * durationMonths * basePrice;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Duration (Months)
          </label>
          <select
            value={durationMonths}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value={1}>1 Month (30 Days)</option>
            <option value={2}>2 Months (60 Days)</option>
            <option value={3}>3 Months (90 Days)</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Date:</span>
            <span className="font-medium">{format(new Date(date), 'MMM dd, yyyy')}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Selected Seats:</span>
            <span className="font-medium">{selectedSeats.length}</span>
          </div>

          {selectedSeats.length > 0 && (
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat._id}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs font-medium"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="font-medium">{durationMonths} month(s)</span>
          </div>

          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400">₹{total}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading || selectedSeats.length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Confirm Booking'
        )}
      </button>

      {selectedSeats.length === 0 && (
        <p className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
          Select seats to continue
        </p>
      )}
    </div>
  );
};

export default BookingSummary;

