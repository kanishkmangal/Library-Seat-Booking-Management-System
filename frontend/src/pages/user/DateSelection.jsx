import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const DateSelection = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate(`/booking/seats?date=${selectedDate}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Select Date</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose the date you want to start your booking
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Booking Start Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg transition-all"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Selected: {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Continue to Seat Selection
        </button>
      </div>
    </div>
  );
};

export default DateSelection;

