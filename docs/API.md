# SaudaSetu AI API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "buyer", // or "vendor"
  "preferredLanguage": "hi",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "coordinates": [72.8777, 19.0760]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user information (requires authentication).

### Products

#### GET /products
Get all products with optional filters.

**Query Parameters:**
- `category` - Filter by category
- `city` - Filter by city
- `state` - Filter by state
- `search` - Search in name and description
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc/desc (default: desc)

#### GET /products/:id
Get a specific product by ID.

#### POST /products
Create a new product (vendors only, requires authentication).

**Request Body:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Organic tomatoes from local farm",
  "category": "vegetables",
  "basePrice": 40,
  "currentPrice": 35,
  "unit": "kg",
  "quantity": 100,
  "images": ["image-url-1", "image-url-2"],
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "coordinates": [72.8777, 19.0760]
  }
}
```

#### PUT /products/:id
Update a product (vendor only, requires authentication).

#### DELETE /products/:id
Delete/deactivate a product (vendor only, requires authentication).

### Negotiations

#### GET /negotiations
Get user's negotiations (requires authentication).

**Query Parameters:**
- `status` - Filter by status: active/completed/cancelled
- `page` - Page number
- `limit` - Items per page

#### GET /negotiations/:id
Get a specific negotiation (requires authentication).

#### POST /negotiations
Start a new negotiation (requires authentication).

**Request Body:**
```json
{
  "productId": "product-id",
  "initialOffer": {
    "price": 30,
    "quantity": 5
  },
  "message": "I'm interested in buying this product"
}
```

#### POST /negotiations/:id/messages
Add a message to negotiation (requires authentication).

**Request Body:**
```json
{
  "message": "Can you do 25 per kg?",
  "offerPrice": 25,
  "offerQuantity": 5
}
```

#### POST /negotiations/:id/complete
Complete/accept a negotiation (requires authentication).

#### POST /negotiations/:id/cancel
Cancel a negotiation (requires authentication).

### Price Discovery

#### GET /price-discovery
Get price discovery data for a category and location.

**Query Parameters:**
- `category` (required) - Product category
- `city` - City name
- `state` - State name

**Response:**
```json
{
  "success": true,
  "data": {
    "productCategory": "vegetables",
    "location": "Mumbai, Maharashtra",
    "averagePrice": 35.50,
    "priceRange": {
      "min": 25.00,
      "max": 45.00
    },
    "marketTrend": "stable", // rising/falling/stable
    "confidence": 0.85,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /price-discovery/trends
Get market trends for multiple categories.

**Query Parameters:**
- `categories` (required) - Comma-separated list of categories
- `city` - City name
- `state` - State name

#### GET /price-discovery/history
Get price history for a category.

**Query Parameters:**
- `category` (required) - Product category
- `city` - City name
- `state` - State name
- `days` - Number of days (default: 30)

#### GET /price-discovery/compare
Compare prices across different locations.

**Query Parameters:**
- `category` (required) - Product category
- `locations` (required) - Comma-separated list of locations

### Translation

#### POST /translation/translate
Translate text between supported languages.

**Request Body:**
```json
{
  "text": "Hello, how much for tomatoes?",
  "fromLanguage": "en",
  "toLanguage": "hi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "translatedText": "नमस्ते, टमाटर के लिए कितना?",
    "confidence": 0.95
  }
}
```

#### GET /translation/languages
Get list of supported languages.

#### POST /translation/detect
Detect language of given text.

**Request Body:**
```json
{
  "text": "नमस्ते"
}
```

## WebSocket Events

### Connection
Connect to WebSocket server with authentication:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Negotiation Events

#### Client to Server Events

- `negotiation:join` - Join a negotiation room
- `negotiation:leave` - Leave a negotiation room
- `negotiation:message` - Send a message
- `negotiation:accept` - Accept current offer
- `negotiation:cancel` - Cancel negotiation
- `negotiation:typing` - Typing indicator

#### Server to Client Events

- `negotiation:joined` - Successfully joined room
- `negotiation:message` - New message received
- `negotiation:offer` - New offer received
- `negotiation:status` - Negotiation status changed
- `negotiation:typing` - Someone is typing

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"] // optional
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Supported Languages

- `hi` - Hindi
- `en` - English
- `bn` - Bengali
- `te` - Telugu
- `mr` - Marathi
- `ta` - Tamil
- `gu` - Gujarati
- `kn` - Kannada
- `ml` - Malayalam
- `pa` - Punjabi
- `or` - Odia
- `as` - Assamese

## Product Categories

- `vegetables`
- `fruits`
- `grains`
- `spices`
- `dairy`
- `meat`
- `fish`
- `pulses`
- `oils`
- `others`

## Units

- `kg` - Kilogram
- `gram` - Gram
- `liter` - Liter
- `piece` - Piece
- `dozen` - Dozen
- `quintal` - Quintal