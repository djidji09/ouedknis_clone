# Ouedkniss Clone Backend API

A complete backend API for an Ouedkniss clone marketplace application built with Express.js, Prisma ORM, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Ad Management**: CRUD operations for classified ads with images
- **Categories**: Hierarchical category system
- **Messaging**: Real-time messaging between users
- **Favorites**: Users can favorite/unfavorite ads
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: API rate limiting for security
- **Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL database
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ouedknis_clone.git
   cd ouedknis_clone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ouedkniss_clone"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # (Optional) Seed the database
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - User logout

### Ads (`/api/ads`)
- `GET /` - Get all ads (with filters)
- `GET /my-ads` - Get current user's ads
- `GET /favorites` - Get user's favorite ads
- `GET /:id` - Get single ad
- `POST /` - Create new ad
- `PUT /:id` - Update ad
- `DELETE /:id` - Delete ad
- `POST /:id/favorite` - Toggle favorite

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `GET /stats` - Get category statistics (Admin)
- `GET /:id` - Get single category
- `POST /` - Create category (Admin)
- `PUT /:id` - Update category (Admin)
- `DELETE /:id` - Delete category (Admin)

### Messages (`/api/messages`)
- `GET /conversations` - Get user conversations
- `GET /unread-count` - Get unread messages count
- `GET /search` - Search messages
- `GET /:userId` - Get messages with specific user
- `POST /` - Send message
- `PUT /:userId/read` - Mark messages as read
- `DELETE /:messageId` - Delete message

### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /stats` - Get user statistics (Admin)
- `GET /:id` - Get user public info
- `GET /:id/profile` - Get user profile with ads
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)
- `PUT /:id/toggle-status` - Toggle user status (Admin)
- `PUT /:id/reset-password` - Reset user password (Admin)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: All inputs are validated and sanitized
- **Password Hashing**: Passwords are hashed using bcryptjs
- **CORS**: Properly configured CORS for cross-origin requests
- **Helmet**: Security headers for protection against common vulnerabilities

## 📊 Database Schema

The application uses the following main models:
- **User**: User accounts and profiles
- **Category**: Hierarchical categories for ads
- **Ad**: Classified advertisements
- **AdImage**: Images associated with ads
- **Message**: Messages between users
- **Favorite**: User favorites/bookmarks
- **AdView**: Analytics for ad views

## 🚦 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:reset` - Reset database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run seed` - Seed database with sample data

### Code Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── prisma/          # Database schema and migrations
├── .env.example     # Environment variables template
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🎉 Acknowledgments

- Inspired by Ouedkniss - Algeria's leading marketplace
- Built with modern Node.js best practices
- Designed for scalability and maintainability
