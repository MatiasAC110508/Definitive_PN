# Perfect Nails Premium 💅

A high-end, luxury web application for **Perfect Nails**, a beauty and wellness center located in Bello, Antioquia. This platform integrates an advanced appointment booking system, a boutique catalog for beauty products, and a comprehensive administrative dashboard.

---

## 🏗️ Architecture & Organization

The project is built following **Clean Architecture** and **Domain-Driven Design (DDD)** principles. This separation of concerns ensures that business logic remains independent of the UI and database implementation.

### Folder Structure

- **`src/domain`**: The core of the application. Contains business entities (e.g., `Appointment`, `User`, `Sale`) and Repository Interfaces that define how data should be handled without specifying the implementation.
- **`src/application`**: Implements the Use Case pattern. Each business action (e.g., `CreateAppointment`, `RegisterSale`) has its own use case class. This layer orchestrates the domain entities.
- **`src/infrastructure`**: External world implementations.
  - `database/prisma`: PostgreSQL persistence.
  - `repositories`: Concrete implementations of domain interfaces using Prisma or Memory (for testing).
  - `security`: Password hashing (BCrypt) and rate limiting.
- **`src/modules`**: Feature-sliced UI components (e.g., `landing`, `appointments`, `admin`).
- **`src/presentation`**: Shared controllers and HTTP helpers (API route logic).
- **`src/app`**: Next.js 15+ App Router file-system routing.

---

## ✨ Features

- **Advanced Booking System**: Clean interface for users to book laser and beauty appointments.
- **Product & Service Catalogs**: Dynamic, responsive catalogs with robust filtering.
- **Complete Admin Dashboard**: Comprehensive suite to manage Products, Services, Appointments, Schedules, Users, and an exclusive **Sales Tracker** feature to easily register external or WhatsApp sales manually.
- **Legal Compliance**: Fully integrated Privacy Policy, Terms of Service, Legal Notice, and dynamic Cookie Consent Banner.

---

## 🔐 Security & Data Protection

- **Authentication**: Powered by **NextAuth.js (Auth.js)** using the `Credentials` provider and a Prisma adapter.
- **Session Management**: Uses **JWT (JSON Web Tokens)** stored in secure, HTTP-only cookies.
- **Password Hashing**: We use **bcryptjs** with a cost factor of 12 for robust protection against brute-force attacks.
- **Validation**: Strict input validation using **Zod** in both frontend and backend.
- **Sanitization**: All user-provided text is sanitized to prevent XSS attacks.
- **Rate Limiting**: Critical endpoints like `/api/auth/register` and `/api/appointments` are protected by an IP-based rate limiter to prevent spam and DDoS.

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- `.env` file with `DATABASE_URL` and `NEXTAUTH_SECRET`

### Steps

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd perfectNails
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Database Setup**:

   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## 👤 Admin Access

The seed script no longer ships with default admin credentials. To create the initial administrator, set these variables locally or in your deployment secrets before running `npm run db:seed`:

```bash
SEED_ADMIN_EMAIL="owner@example.com"
SEED_ADMIN_PASSWORD="" # set locally, minimum 12 characters
SEED_ADMIN_NAME="Perfect Nails Admin"
SEED_ADMIN_PHONE=""
```

Do not commit real credentials. The monthly revenue metric is strictly restricted to the Admin role and is not visible to regular users or staff.

---

## 🎨 Aesthetics

- **Marble & Gold**: Custom CSS tokens in `globals.css` for a premium look.
- **Glassmorphism**: Backdrop blur effects for cards and overlays.
- **Smooth Motion**: Powered by **Framer Motion** for an editorial feel.
