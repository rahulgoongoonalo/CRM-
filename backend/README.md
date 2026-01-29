# CRM Backend API

Node.js backend with MongoDB for the CRM application.

## Setup Instructions

### 1. Install MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Or install via Chocolatey: `choco install mongodb`

**Start MongoDB:**
```bash
mongod
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the backend directory (already created) and update if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 4. Start the Server
```bash
npm run dev
```

The server will start on http://localhost:5000

## Default Admin Credentials
- Email: admin@crm.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new staff user
- `POST /api/auth/login` - Login user

### Members (Protected)
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Health Check
- `GET /api/health` - Server health check

## Authentication
All member routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
