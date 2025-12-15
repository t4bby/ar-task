# AR Task Management System

A full-stack booking and messaging application with ServiceM8 integration, built with Next.js and Express.js.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Express](https://img.shields.io/badge/Express-5.1-green?style=flat&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-7.1-2D3748?style=flat&logo=prisma)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.18.0
- pnpm >= 10.25.0

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ar-task

# Install dependencies
pnpm install

# Setup backend environment
cd apps/backend
cp .env.example .env
# Edit .env with your configuration

# Setup frontend environment
cd ../frontend
cp .env.example .env.local

# Initialize database
cd ../backend
pnpm prisma generate
pnpm prisma migrate deploy

# Return to root
cd ../..
```

### Running the Application

**Development Mode:**

#### Terminal 1 - Backend (http://localhost:8080)
```bash
cd apps/backend
pnpm start:dev
```

#### Terminal 2 - Frontend (http://localhost:3000)
```bash
cd apps/frontend
pnpm dev
```

## 🧪 Testing

```bash
# Run backend tests
cd apps/backend
pnpm test

# Run with coverage
pnpm test:cov

# Run specific test file
pnpm test bookingRouter
```

## 📖 API Documentation

Access the interactive API documentation at:
- **Local**: http://localhost:8080/
- **Swagger UI**: Interactive API explorer


## 📁 Project Structure

```
ar-task/
├── apps/
│   ├── backend/          # Express.js API
│   │   ├── src/
│   │   │   ├── api/      # API endpoints
│   │   │   ├── common/   # Shared code
│   │   │   └── server.ts
│   │   └── prisma/       # Database
│   └── frontend/         # Next.js app
│       └── src/
│           ├── app/      # Pages
│           ├── components/
│           └── lib/
├── TECH_NOTES.md        # Technical details
└── package.json
```

## 🔧 Configuration

### Backend Environment Variables

```env
PORT=8080
NODE_ENV=development
DATABASE_URL="file:./database.sqlite"
SESSION_SECRET=your-secret-key
SERVICEM8_API_KEY=your-api-key
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

