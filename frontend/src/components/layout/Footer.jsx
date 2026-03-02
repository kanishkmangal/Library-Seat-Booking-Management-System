const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Library Seat Booking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your library seat reservations efficiently and conveniently.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </a>
              </li>
              <li>
                <a href="/booking" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Book Seat
                </a>
              </li>
              <li>
                <a href="/booking/history" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  My Bookings
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Developer</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">Kanishk Mangal</p>
              <p>Full Stack Developer</p>
              <p className="mt-2 text-xs">Tech Stack: React, Node.js, Express, MongoDB</p>
              <p className="text-xs mt-1">Responsibilities:</p>
              <ul className="text-xs list-disc list-inside ml-2 space-y-0.5">
                <li>UI/UX design & frontend development</li>
                <li>Backend APIs & database design</li>
                <li>Authentication & seat booking logic</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Library Seat Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

