import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, color: 'blue' },
    { title: 'Total Seats', value: stats?.totalSeats || 0, color: 'green' },
    { title: 'Available Seats', value: stats?.availableSeats || 0, color: 'green' },
    { title: 'Locked Seats', value: stats?.lockedSeats || 0, color: 'gray' },
    { title: 'Active Bookings', value: stats?.activeBookings || 0, color: 'purple' },
    { title: 'Currently Booked', value: stats?.currentlyBooked || 0, color: 'orange' },
    { title: 'Occupancy Rate', value: `${stats?.occupancyRate || 0}%`, color: 'indigo' },
    { title: 'Monthly Revenue', value: `₹${stats?.monthlyRevenue || 0}`, color: 'indigo' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      gray: 'bg-gray-500 text-white',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${getColorClasses(stat.color)} rounded-lg shadow-lg p-6`}
          >
            <h3 className="text-lg font-medium mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/admin/seats"
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold mb-2">Manage Seats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create, update, or delete seats
            </p>
          </a>
          <a
            href="/admin/bookings"
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold mb-2">View All Bookings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and cancel bookings
            </p>
          </a>
          <a
            href="/admin/reports"
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold mb-2">Monthly Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View booking reports and analytics
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

