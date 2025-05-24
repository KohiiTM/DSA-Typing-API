# DSA Typing Practice API

A RESTful API for DSA (Data Structures and Algorithms) typing practice exercises. This API provides a collection of programming topics and problems to help users practice typing while learning important bits of data structures and algorithms.

## Features

- Get all DSA topics
- Filter topics by category
- Get random topics for practice
- View all available categories
- Rate limiting protection
- API documentation with Swagger UI
- Health check endpoint

## 🔗 API Endpoints

- `GET /api/topics` - Get all topics
- `GET /api/topics/category/:category` - Get topics by category
- `GET /api/topics/random` - Get a random topic
- `GET /api/categories` - Get all categories
- `GET /health` - Check API health status
- `GET /api-docs` - View API documentation

## 🛠️ Tech Stack

- Node.js
- Express.js
- Winston (Logging)
- Swagger UI (Documentation)
- Helmet (Security)
- Express Rate Limit (Rate Limiting)

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Access the interactive API documentation at `/api-docs` when the server is running. This provides a user-friendly interface to:

- View all available endpoints
- Test the API directly from the browser
- See request/response schemas
- Try out different parameters

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS enabled
- Input validation
- Error handling middleware

## 📝 Logging

The API uses Winston for logging:

- Error logs: `error.log`
- Combined logs: `combined.log`
- Console logging in development mode

## 🏥 Health Check

Use the `/health` endpoint to:

- Monitor API status
- Check if the service is running
- Get current timestamp

## Contributing

Feel free to submit issues and enhancement requests!
