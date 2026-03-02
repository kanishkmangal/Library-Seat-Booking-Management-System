# Library Seat Booking Management System

A full-stack application for managing library seat reservations, inspired by BookMyShow's movie ticket booking flow. Users can book seats for 1, 2, or 3 months, and admins can manage seats, view bookings, and generate reports.

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Context API for state management
- Axios for API calls
- Tailwind CSS for styling
- Dark/Light theme support

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication (access + refresh tokens)
- RESTful API architecture

## Features

### User Features
- User registration and login
- View seat layout with real-time availability
- Select and book seats for 1, 2, or 3 months
- Booking confirmation page
- View booking history
- Cancel bookings

### Admin Features
- Admin dashboard with statistics
- Create and manage seat layouts
- Lock/unlock seats
- View all bookings with filters
- Cancel bookings
- Generate monthly reports

## Project Structure

```
Library Project/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Auth middleware
│   ├── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # Context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
# Copy the example file
cp .env.example .env
```

Or create `.env` manually with the following content:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/library-seat-booking

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-seat-booking

# JWT Configuration
# IMPORTANT: Change these to strong, random strings in production (minimum 32 characters)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Note:** Make sure MongoDB is running before starting the server. For local MongoDB, ensure the service is started. For MongoDB Atlas, use the connection string from your cluster.

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Creating an Admin User

To create an admin user, you have several options:

1. **Using the provided script (Recommended):**
   ```bash
   cd backend
   npm run create-admin [email] [password] [name]
   ```
   Example:
   ```bash
   npm run create-admin admin@library.com admin123 "Admin User"
   ```
   If no arguments are provided, it will use default values:
   - Email: admin@example.com
   - Password: admin123
   - Name: Admin User

2. **Using MongoDB directly:**
   - Connect to your MongoDB database
   - Insert a user document with `role: 'admin'`:
   ```javascript
   db.users.insertOne({
     name: "Admin User",
     email: "admin@example.com",
     password: "$2a$12$hashedpassword", // Use bcrypt to hash password
     role: "admin"
   })
   ```

3. **Using the registration endpoint:**
   - Register a user normally through the frontend
   - Update the user's role in MongoDB to 'admin'

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Bookings (Protected)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Seats
- `GET /api/seats/layout` - Get seat layout for a date
- `GET /api/seats` - Get all seats (protected)
- `GET /api/seats/:id` - Get seat by ID

### Admin (Admin Only)
- `POST /api/admin/seats` - Create seat
- `POST /api/admin/seats/bulk` - Bulk create seats
- `PATCH /api/admin/seats/:id` - Update seat
- `DELETE /api/admin/seats/:id` - Delete seat
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/cancel` - Cancel booking
- `GET /api/admin/reports/monthly` - Get monthly report
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Key Features Implementation

### Seat Booking Logic
- Seats can only be booked for full months (1, 2, or 3 months)
- Double booking prevention at database level
- Real-time seat availability checking
- Visual seat grid similar to BookMyShow

### Authentication
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiry
- Protected routes for authenticated users
- Role-based access control (user/admin)

### Error Handling
- Comprehensive error handling on both frontend and backend
- User-friendly error messages
- Proper HTTP status codes

## Development Notes

- The backend uses ES6 modules (type: "module")
- Frontend uses Vite for fast development
- Tailwind CSS is configured with dark mode support
- All API calls are handled through Axios with interceptors
- Context API manages global authentication state

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use strong, unique secrets for JWT tokens
3. Configure MongoDB Atlas or production MongoDB instance
4. Build frontend: `npm run build` in frontend directory
5. Serve frontend build files using a web server (nginx, etc.)
6. Use environment variables for all sensitive data

## License

This project is for educational purposes.

