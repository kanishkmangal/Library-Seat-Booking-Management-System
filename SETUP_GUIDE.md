# Setup Guide - Library Seat Booking System

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-seat-booking
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

**Expected output:**
```
Connected to MongoDB
Database: library-seat-booking
Server running on port 5000
Environment: development
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Create Admin User

In a new terminal:
```bash
cd backend
npm run create-admin admin@library.com admin123 "Admin User"
```

## Troubleshooting Network Errors

### Error: "Cannot connect to backend server"

**Solution:**
1. Check if backend is running:
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `Server running on port 5000`

2. Check if MongoDB is running:
   - Windows: Check Services for MongoDB
   - Or run: `mongod` in a terminal

3. Verify backend health:
   - Open browser: `http://localhost:5000/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

4. Check CORS settings:
   - Backend should allow `http://localhost:3000`
   - Already configured in `server.js`

### Error: "MongoDB connection error"

**Solution:**
1. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Or start manually
   mongod
   ```

2. Check MongoDB URI in `.env`:
   - Local: `mongodb://localhost:27017/library-seat-booking`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/library-seat-booking`

### Error: "Port 5000 already in use"

**Solution:**
1. Find and kill process:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Or change PORT in .env
   PORT=5001
   ```

2. Update frontend API URL if port changed:
   - Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

## Testing the Connection

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Frontend Connection:**
   - Open browser console (F12)
   - Check Network tab
   - Try logging in
   - Look for API calls to `/api/auth/login`

## Common Issues

### Issue: Frontend shows "Network error" but backend is running

**Fix:**
- Check Vite proxy configuration in `vite.config.js`
- Restart frontend dev server
- Clear browser cache

### Issue: CORS errors in browser console

**Fix:**
- Backend CORS is configured for `localhost:3000`
- If using different port, update `corsOptions` in `backend/server.js`

### Issue: Login works but other API calls fail

**Fix:**
- Check if JWT token is being sent in headers
- Verify token in localStorage
- Check backend middleware authentication

## Development Tips

1. **Always start backend first** - Frontend depends on it
2. **Check browser console** - Most errors show there
3. **Check backend terminal** - Server logs show API requests
4. **Use Network tab** - See actual API calls and responses

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use strong JWT secrets (32+ characters)
3. Configure proper CORS origins
4. Use environment-specific MongoDB URI
5. Build frontend: `npm run build`
6. Serve frontend build with nginx or similar

