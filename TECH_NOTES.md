# Technical Notes - AR Task Management System

**Project**: Full-stack Booking & Messaging Application  
**Date**: December 15, 2025  
**Tech Stack**: Next.js 16, Express.js, Prisma, SQLite, TypeScript

---
### Features Implemented

#### 1. **User Authentication System**

- User registration with bcrypt password hashing
- Session-based authentication using express-session
- Protected routes on both frontend and backend
- Automatic session validation and redirection

#### 2. **Booking Management**

- Create bookings via REST API with validation
- List all user bookings with pagination support
- View detailed booking information with attachments
- Real-time status tracking (Work Order, Pending, Confirmed, Completed, Cancelled)
- Date-based scheduling with ISO datetime support

#### 3. **Messaging System**

- Real-time messaging on bookings
- User-specific message styling
- Message history persistence
- Input validation (no empty messages)
- File upload support for message attachments (images, PDFs, documents)
- Download attachments from messages
- Multiple file uploads per message (up to 5 files, 10MB each)

#### 4. **ServiceM8 Integration**

**Implemented API Endpoints:**

- **Client Creation**: Automatic ServiceM8 company/client creation on user registration
  - Creates company record with user details (name, email, phone)
  - Stores ServiceM8 UUID in local database for reference
  - Graceful degradation: continues registration even if ServiceM8 API fails
  - Error logging for debugging API issues

- **Job Creation**: Automatic ServiceM8 job creation when booking is created
  - Creates job linked to user's ServiceM8 company UUID
  - Syncs booking details (title, description, status, date)
  - Maps booking status to ServiceM8 job status
  - Continues booking creation even if job creation fails (fault tolerance)
  - Logs errors for monitoring and debugging

**Implementation Details:**

- Service layer: `serviceM8Service.ts` handles all API communication
- Environment-based API key configuration
- RESTful HTTP calls using axios
- Comprehensive error handling and logging
- UUID-based entity tracking for data consistency

#### 5. **Frontend UI**

- Modern, responsive design using shadcn/ui components
- Form validation with error display
- Loading states and skeleton loaders
- Toast notifications for user feedback
- Dark mode support (via Tailwind)

### API Endpoints

**Authentication:**

- `POST /register` - User registration
- `POST /login` - User login
- `POST /login/logout` - User logout
- `GET /login/session` - Check session status

**Bookings:**

- `GET /bookings` - List user's bookings
- `POST /bookings` - Create new booking (triggers ServiceM8 job creation)
- `GET /bookings/:id` - Get booking details with attachments and messages
- `POST /bookings/:id/messages` - Send message to booking (supports file uploads via multipart/form-data)
- `GET /bookings/:bookingId/attachments/:attachmentId` - Get attachment details
- `GET /bookings/:bookingId/messages/:messageId/attachments/:attachmentId` - Download message attachment file

**Utility:**

- `GET /health-check` - Health check endpoint
- `GET /` - OpenAPI documentation

---

## Reasoning behind your approach
1. **Modular Architecture**
    - Separation of concerns with distinct layers (controllers, services, models)
    - Easier maintenance and scalability
2. **Type Safety**
    - TypeScript for both frontend and backend
    - Zod for runtime validation
3. **User Experience**
    - Responsive design with shadcn/ui
    - Real-time feedback with loading states 
4. **Prisma + SQLite ORM**
   - Type-safe ORM with migrations, SQLite for dev simplicity
   - Zero-config database, PostgreSQL production path
5. **Session-Based Auth (express-session)**
   - Simpler than JWT for server-rendered apps
   - Server-side session invalidation, CSRF protection
6. **REST API**
   - Standard HTTP semantics, easier ServiceM8 integration pattern
   - Cacheable, tooling support, widely understood

### Architectural Decisions
- Separate apps - Frontend/backend can scale independently
- Shared types - Reduce duplication, type safety across boundary
- File uploads  - Multipart form-data over Base64 (efficiency)
- Status enums  - Prevent invalid states, easy validation
- UUID for ServiceM8 - External system IDs kept separate from internal

## 🚀 Potential Improvements

### Short-term Improvements (MVP+)

1. **Enhanced Validation**
    - Client-side validation before API calls
    - Better error messages with field-specific feedback
    - Phone number format validation

2. **Search & Filter**
    - Search bookings by title/description
    - Filter by status, date range
    - Sort by multiple criteria

3. **Pagination**
    - Implement cursor-based pagination for bookings
    - Lazy loading for messages
    - Infinite scroll support

4. **User Profile Management**
    - Update user details (name, email, phone)
    - Change password functionality
    - View ServiceM8 linked company details

5. **Role Management**
    - Admin and user roles
    - Admin dashboard for managing users/bookings
    - Role-based access control

---

## 🤖 How AI Assisted the Workflow

### Development Acceleration

1. **Problem-Solving**
    - Debugging TypeScript errors
    - Next.js App Router patterns

2. **Testing** (Comprehensive coverage)
    - Unit test generation for API endpoints
    - Mock data creation
    - Edge case identification
    - Test refactoring (API vs. database)

### Specific AI Contributions

#### Frontend Development

- Created form components with validation
- Implemented shadcn/ui components

#### Testing & Quality

- Wrote comprehensive test suites
- Validated build process and type safety

## 🏗️ Tech Stack

### Backend

- Express.js 5.1
- TypeScript 5.9
- Prisma ORM 7.1
- SQLite (dev) / PostgreSQL (prod)
- Zod validation
- Vitest testing

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- shadcn/ui + Radix UI
- Tailwind CSS 4
- Axios

### DevOps

- Turborepo (monorepo)
- pnpm workspaces
- ESLint + Prettier
- Husky git hooks