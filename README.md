# Saree Hub – Saree Management System

Saree Hub is a full-stack saree management and e-commerce platform designed to support both **administrative inventory management** and **customer purchasing workflows** within a single system.

The platform allows administrators to manage saree products, monitor customer orders, and update order stages, while users can browse products, place orders, choose payment methods, and track their purchases through a structured order lifecycle.

---

## Platform Overview

Saree Hub is built around two main user roles:

### Admin
Administrators manage saree inventory and customer orders.

### User
Customers can browse sarees, place orders, complete checkout, and track order progress.

The system follows a full-stack client-server architecture with a **React frontend**, a **Node.js / Express backend**, and a **MongoDB database**.

---

## Technology Stack

## Frontend
- React
- JavaScript
- CSS Modules
- React Router
- State management
- REST API integration

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Role-based authorization
- Multer for file uploads

## Database & Storage
- MongoDB
- Local file upload support

---

## System Architecture

```text
React Frontend
      |
      | REST API
      v
Node.js / Express Backend
      |
      v
MongoDB Database
```

The backend handles authentication, saree management, order processing, role-based access control, file uploads, and order stage tracking.

---

## Core Features

## Authentication & Authorization

The system includes a real login system using **JWT authentication** with role-based access control.

Features include:

- User registration and login
- JWT-based authentication
- Role separation for **ADMIN** and **USER**
- Protected routes for admin and user features

---

## Saree Management

Administrators can manage saree products through full CRUD operations.

Admin capabilities include:

- Create new saree products
- Update saree information
- Delete saree products
- Manage inventory-related product details

---

## Checkout & Buying Process

Users can purchase sarees through a structured checkout flow.

Supported payment options include:

- Cash
- Card (demo flow)

The card payment flow includes **basic validation only** and is intended for demonstration purposes.

> This project does **not** process real payments and does **not** store actual card details.

---

## Order Management

The system supports order creation and stage-based tracking.

### Order stages
- `PENDING`
- `VERIFYING`
- `ACCEPTED`
- `DONE`

### Admin order features
- View paid orders
- Monitor customer purchases
- Update order stages

### User order features
- View personal orders
- Track current order stage
- Monitor paid items

---

## Admin Dashboard

The admin dashboard provides order and product management functionality.

Admins can:

- Access saree management features
- View paid orders
- Update order stages
- Manage the operational flow of customer purchases

---

## User Features

Users can interact with the shopping system through customer-focused pages.

User capabilities include:

- Browse saree products
- View product-related information
- Add items to purchase flow
- Complete checkout
- View order history
- Track order stages

---

## Frontend Structure

The frontend is organized into reusable modules and page-based UI sections.

Main frontend areas include:

### Components
- Footer
- Navbar
- Protected Route

### Pages
- Admin Page
- Checkout Page
- Login Page
- Orders Page
- Profile Page
- Shop Page

### Other frontend modules
- Services
- State
- CSS module styling
- App-level routing and structure

The UI uses **CSS Modules only**, which keeps component and page styles isolated without relying on global styling.

---

## Backend Structure

The backend is organized into modular folders.

Main backend areas include:

### Configuration
- Database connection configuration

### Controllers
- Authentication controller
- Order controller
- Saree controller
- User controller

### Middleware
- Authentication middleware
- Upload middleware

### Models
- Order model
- Saree model
- User model

### Routes
- Authentication routes
- Order routes
- Saree routes
- User routes

### Other backend modules
- Uploads folder
- Utility functions
- Environment configuration

---

## File Upload Support

The backend includes an **uploads** directory for storing uploaded files during development.

Uploaded files are stored locally when the system runs in a local environment.

For production deployment, cloud storage solutions such as:

- Amazon S3
- Cloudinary

are recommended.

---

## Project Structure

```text
SAREE-HUB
│
├── backend
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── sareeController.js
│   │   └── userController.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models
│   │   ├── orderModel.js
│   │   ├── sareeModel.js
│   │   └── userModel.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── sareeRoutes.js
│   │   └── userRoutes.js
│   ├── uploads
│   ├── utils
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── state
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── package.json
├── package-lock.json
└── README.md
```

---

## Backend Setup

## Requirements

- Node.js
- npm
- MongoDB

## Backend environment configuration

Create a `.env` file inside the `backend/` folder using the following example:

```env
MONGO_URI=mongodb://localhost:27017/sareeManagement
PORT=5000
JWT_SECRET=change_me_to_a_long_random_secret

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@saree.com
ADMIN_PASSWORD=Admin123!
```

### Environment variable details

- `MONGO_URI` – MongoDB connection string
- `PORT` – Backend server port
- `JWT_SECRET` – Secret key used for JWT authentication
- `ADMIN_NAME` – Default admin name
- `ADMIN_EMAIL` – Default admin email
- `ADMIN_PASSWORD` – Default admin password

> Do not commit real secrets or production credentials to GitHub. Use placeholder values in public repositories.

## Run the backend

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

## Requirements

- Node.js
- npm

## Optional frontend environment configuration

Create a `.env` file inside the `frontend/` folder if needed:

```env
REACT_APP_API_BASE=http://localhost:5000
```

## Run the frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

---

## Default Admin Login

The backend can automatically create a default admin account if it does not already exist.

### Default admin credentials

```text
Email: admin@saree.com
Password: Admin123!
```

> These are development credentials. Change them before using the system in a real environment.

---

## Security Notes

Saree Hub includes:

- JWT-based authentication
- Role-based route protection
- Admin and user access separation

Sensitive values such as:

- MongoDB connection strings
- JWT secrets
- admin credentials

should always be stored in environment variables and never committed publicly with real values.

---

## Notes About Card Payments

This project includes a **demo card payment flow** for demonstration purposes only.

Important notes:

- No real payment gateway is integrated
- No actual card transactions are processed
- No sensitive card details are permanently stored

This flow is intended only to demonstrate checkout UI and order handling logic.

---

## Future Improvements

Potential future enhancements include:

- Real payment gateway integration
- Product image management via cloud storage
- Search and filtering improvements
- Stock management features
- Order analytics dashboard
- Customer reviews and ratings
- Email notifications
- Docker-based deployment
- Cloud hosting

---

## Project Status

Saree Hub is a full-stack saree management and shopping system prototype demonstrating:

- JWT-based authentication
- Admin product CRUD
- User checkout workflow
- Order stage management
- Role-based access control
- Local upload support
- Modular React frontend with CSS Modules

The system can be extended into a more advanced fashion e-commerce platform with production-ready infrastructure and payment integration.

---

## Author

Chanuth Jayasekera