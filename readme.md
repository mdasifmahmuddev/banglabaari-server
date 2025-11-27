# BanglaBaari Server - Backend API

Express.js for BanglaBaari e-commerce platform.

---

## Links

**Live API:** [https://bb-backend-delta.vercel.app](https://bb-backend-delta.vercel.app)  
**GitHub:** [https://github.com/mdasifmahmuddev/banglabaari-server](https://github.com/mdasifmahmuddev/banglabaari-server)  
**Frontend:** [https://bb-frontend-eight.vercel.app](https://bb-frontend-eight.vercel.app)  
**Admin Dashboard:** [https://bb-frontend-eight.vercel.app/admin/login](https://bb-frontend-eight.vercel.app/admin/login)

---

## Quick Setup

```bash
npm install
```

Create `.env`:
```env
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm start
```

Server runs at `http://localhost:5000`

---

## Tech Stack

**Backend:** Express.js, MongoDB, Mongoose  
**Auth:** JWT, Google OAuth  
**Hosting:** Vercel

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/google` | No |
| POST | `/api/auth/admin/login` | No |

### Products
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products` | No |
| GET | `/api/products/:id` | No |
| POST | `/api/products` | Yes |
| DELETE | `/api/products/:id` | Yes |

### Admin
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/admin/users` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/products` | Admin |

---

## Project Structure

```
backend/
├── config/         # Database config
├── middleware/     # Auth middleware
├── models/         # MongoDB schemas
├── routes/         # API routes
└── server.js       # Entry point
```

---

## Features

- JWT authentication
- Google OAuth integration
- MongoDB database
- Password hashing with bcrypt
- CORS enabled
- Input validation
- Admin role management
- Admin dashboard API support

---

## Admin Credentials

Set in `.env`:
```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

Access admin dashboard at: [https://bb-frontend-eight.vercel.app/admin/login](https://bb-frontend-eight.vercel.app/admin/login)

---

## Database Models

**User:** name, email, password, role  
**Product:** title, description, price, category, image, userId

---
 