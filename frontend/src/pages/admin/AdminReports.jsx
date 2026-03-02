import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { adminAPI } from '../../services/api';

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadReport();
  }, [filters]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMonthlyReport({
        month: filters.month,
        year: filters.year,
      });
      setReport(response.data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading report...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monthly Reports</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Month</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {format(new Date(2024, month - 1, 1), 'MMMM')}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            min="2020"
            max="2100"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {report && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold">{report.totalBookings}</p>
            </div>
            <div className="bg-green-500 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">₹{report.totalRevenue}</p>
            </div>
            <div className="bg-purple-500 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">Seats Booked</h3>
              <p className="text-3xl font-bold">{report.totalSeatsBooked}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            {report.bookings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No bookings for this month</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.bookingId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.user?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.seats.map((s) => s.seatNumber).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.durationMonths} month(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          ₹{booking.totalAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;

