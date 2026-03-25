import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Links definitions
  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Seats', path: '/admin/seats' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Reports', path: '/admin/reports' },
  ];

  const userLinks = [
    { name: 'Book Seat', path: '/booking' },
    { name: 'My Bookings', path: '/booking/history' },
  ];

  const links = user ? (user.role === 'admin' ? adminLinks : userLinks) : [];

  return (
    <nav ref={navRef} className="bg-white dark:bg-gray-800 shadow-md w-full relative z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always visible */}
          <Link 
            to="/" 
            className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0 select-none"
            onClick={() => setIsMenuOpen(false)}
          >
            Library Seat Booking
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-l border-gray-300 dark:border-gray-600 h-6 mx-2"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Hello, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center gap-2 sm:gap-3">
            {user && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                Hi, {user.name.split(' ')[0]}
              </span>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none p-1.5 sm:p-2 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90 scale-110' : ''}`} 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-xl border-t border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1 flex flex-col">
          {user ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 mt-1 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

