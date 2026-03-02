import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Library Seat Booking System
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Reserve your study space with ease
        </p>

        {user ? (
          <div className="space-x-4">
            {user.role === 'admin' ? (
              <Link
                to="/admin/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/booking"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book a Seat
              </Link>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select your preferred seat and book for 1, 2, or 3 months
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Real-time Availability</h3>
          <p className="text-gray-600 dark:text-gray-400">
            See seat availability in real-time with visual indicators
          </p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your bookings from one place
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

