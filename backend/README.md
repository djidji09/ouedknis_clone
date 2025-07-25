# Ouedkniss Clone Backend API

A modern marketplace API built with Express.js and Supabase for Algeria's classified ads platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Supabase account

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file with your Supabase credentials:
```env
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

### Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Health Check
- `GET /api/health` - API health status

## 🧪 Testing

### Registration
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/register" -Headers @{"Content-Type"="application/json"} -Body '{"name":"Ahmed Benali","email":"ahmed@test.com","password":"password123","phone":"+213555123456"}'
```

### Login
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/login" -Headers @{"Content-Type"="application/json"} -Body '{"email":"ahmed@test.com","password":"password123"}'
```

## 🏗️ Database Setup

Create the following table in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

## 🛠️ Technologies Used
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure
```
backend/
├── config/
│   └── db.js              # Supabase configuration
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── error.js          # Error handling
│   ├── rateLimiter.js    # Rate limiting
│   └── validation.js     # Input validation
├── routes/
│   ├── authRoutes.js     # Authentication routes
│   └── index.js          # Route aggregation
├── scripts/
│   └── seed.js           # Database seeding
├── server.js             # Express server setup
└── package.json          # Dependencies
```

## ✅ Status
- ✅ **Authentication System** - Registration, Login, Profile management
- ✅ **Database Integration** - Supabase connected and working
- ✅ **Security** - JWT tokens, password hashing, rate limiting
- ✅ **Input Validation** - Request validation and sanitization
- ✅ **Error Handling** - Centralized error management

## 🔑 Test Credentials
After running the seed script:
- **Email**: `ahmed@example.com`
- **Password**: `password123`

---
*Built with ❤️ for Algeria's marketplace needs*
