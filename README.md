# E-commerce API

A comprehensive RESTful API for an e-commerce platform built with Node.js, Express, MongoDB, and integrated with Flutterwave for secure payment processing.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Product Management**: CRUD operations for products with image upload support
- **Shopping Cart**: Add, update, remove items with real-time stock validation
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Flutterwave payment gateway integration
- **Webhook Support**: Automatic payment verification via webhooks
- **Stock Management**: Automatic inventory updates after successful payments

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Flutterwave
- **File Upload**: Multer
- **Environment Variables**: dotenv

## 📁 Project Structure

```
E-commerceApi/
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── productController.js   # Product management
│   ├── cartController.js      # Shopping cart operations
│   └── paymentController.js   # Payment processing
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── User.js               # User schema
│   ├── Product.js            # Product schema
│   ├── Cart.js               # Shopping cart schema
│   └── Order.js              # Order schema
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── productRoutes.js      # Product routes
│   ├── cartRoutes.js         # Cart routes
│   └── paymentRoutes.js      # Payment routes
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── index.js                 # Main server file
└── package.json             # Dependencies and scripts
```

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dayvhiid/Simple-E-commerce-API.git
   cd E-commerceApi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add:
   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Flutterwave Configuration
   FLW_PUBLIC_KEY=your_flutterwave_public_key
   FLW_SECRET_KEY=your_flutterwave_secret_key
   FLW_SECRET_HASH=your_webhook_secret_hash
   
   # Server Configuration
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Protected)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 29.99,
  "quantity": 100,
  "category": "Electronics"
}
```

#### Update Product (Protected)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 39.99
}
```

#### Delete Product (Protected)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Cart Endpoints

#### Get User's Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_object_id",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_object_id",
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### Payment Endpoints

#### Initiate Payment
```http
POST /api/payments/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1234567890",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

#### Verify Payment
```http
GET /api/payments/verify/:reference
Authorization: Bearer <token>
```

#### Get Order History
```http
GET /api/payments/orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /api/payments/orders/:orderId
Authorization: Bearer <token>
```

#### Webhook (Flutterwave)
```http
POST /api/payments/webhook
Content-Type: application/json
verif-hash: <flutterwave_signature>

{
  "event": "charge.completed",
  "data": {
    // Flutterwave webhook payload
  }
}
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 💳 Payment Flow

1. **Add items to cart** using cart endpoints
2. **Initiate payment** with shipping details
3. **Redirect user** to Flutterwave payment page
4. **Payment processing** handled by Flutterwave
5. **Webhook notification** automatically updates order status
6. **Inventory updated** and cart cleared on successful payment

## 🌐 Flutterwave Integration

### Webhook Configuration

1. Log in to your Flutterwave dashboard
2. Navigate to **Settings → Webhooks**
3. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Set a secret hash in your environment variables

### Test Cards (Sandbox)

```
Card Number: 5531886652142950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FLW_PUBLIC_KEY` | Flutterwave public key | Yes |
| `FLW_SECRET_KEY` | Flutterwave secret key | Yes |
| `FLW_SECRET_HASH` | Webhook verification hash | Yes |
| `PORT` | Server port (default: 4000) | No |
| `FRONTEND_URL` | Frontend URL for redirects | No |

## 🧪 Testing

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Test authentication endpoints first to get JWT token
4. Use the token for protected endpoints

### Manual Testing Flow

1. Register a new user
2. Login to get JWT token
3. Create some products
4. Add products to cart
5. Initiate payment
6. Complete payment on Flutterwave
7. Verify order completion

## 🚀 Deployment

### Prerequisites

- Node.js 14+ installed
- MongoDB database (local or cloud)
- Flutterwave account (test or live)

### Production Considerations

1. **Environment Variables**: Use production values
2. **Database**: Use MongoDB Atlas or dedicated MongoDB server
3. **HTTPS**: Enable SSL/TLS for secure communication
4. **Process Manager**: Use PM2 for production deployment
5. **Logging**: Implement proper logging with winston or similar
6. **Rate Limiting**: Add rate limiting middleware
7. **CORS**: Configure CORS for your frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Dayvhiid** - *Initial work* - [GitHub Profile](https://github.com/Dayvhiid)




