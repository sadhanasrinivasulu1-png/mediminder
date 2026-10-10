# 💊 MediMinder — Full-Stack Medicine Reminder System

A full-stack healthcare web application designed to help patients and caregivers manage medication schedules, receive real-time audio and browser alerts, and track daily adherence.

![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-000000)

---

## 🌟 Key Features

1. **Modern Healthcare UI (Blue & White Theme):**
   - Responsive design crafted with React and Tailwind CSS.
   - 8 Complete Pages: Home, Register, Login, Dashboard, Add Medicine, Medicine Schedule, Reminder History, and User Profile.

2. **Smart Scheduling & Medicine Management:**
   - Multi-time daily reminders (e.g., 08:00 AM, 01:00 PM, 08:00 PM).
   - Frequency options: **Daily** or **Specific Days** of the week (Mon, Wed, Fri, etc.).
   - Dosage instructions and customizable start/end date durations.
   - Edit, delete, and view active medication schedules.

3. **Background Reminder Engine & Real-time Alerts:**
   - Automated reminder slot generation powered by **Node-Cron** (`* * * * *`).
   - Browser push notifications via Web Notification API.
   - Built-in soothing medical chime using the Web Audio API (no external mp3 dependency).
   - Interactive modal popups to immediately mark doses as **Taken** or **Skipped**.
   - Automatic detection of overdue and missed reminders.
   - Conflict-free unique constraints preventing duplicate reminder instances.

4. **Security & Authentication:**
   - JWT-based authentication stored with standard Bearer authorization headers.
   - Password encryption with `bcryptjs` (salt rounds: 10).
   - Strict data isolation ensuring users access only their own medicines and reminders.

5. **MySQL Database Architecture:**
   - Enterprise-grade MySQL DDL schema (`database/schema.sql`).
   - Automatic table migration and connection pooling (`mysql2/promise`).
   - Seamless zero-config failover fallback for instant evaluation even before starting a local MySQL instance.

---

## 🏗️ Project Folder Structure

```
mediminder/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReminderModal.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ReminderContext.jsx
│   │   ├── hooks/
│   │   │   └── useNotification.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AddMedicinePage.jsx
│   │   │   ├── MedicineSchedulePage.jsx
│   │   │   ├── ReminderHistoryPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── medicineController.js
│   │   └── reminderController.js
│   ├── jobs/
│   │   └── reminderScheduler.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Medicine.js
│   │   ├── Reminder.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicineRoutes.js
│   │   └── reminderRoutes.js
│   ├── services/
│   │   └── notificationService.js
│   ├── app.js
│   ├── server.js
│   └── package.json
├── database/
│   └── schema.sql
├── .env.example
└── README.md
```

---

## 🗄️ MySQL Database Schema

The database consists of 4 relational tables:

```
+--------------------+        +--------------------+
|       users        | 1    * |     medicines      |
|--------------------|--------|--------------------|
| id (PK)            |        | id (PK)            |
| name               |        | user_id (FK)       |
| email (UQ)         |        | medicine_name      |
| password_hash      |        | dosage             |
| timezone           |        | instructions       |
| created_at         |        | start_date         |
+--------------------+        | end_date           |
         |                    | frequency          |
         | 1                  +--------------------+
         |                              | 1
         |                              |
         | 1                            | *
+--------------------+        +--------------------------+
|     reminders      | *      | medicine_reminder_times  |
|--------------------|--------|--------------------------|
| id (PK)            |        | id (PK)                  |
| user_id (FK)       |        | medicine_id (FK)         |
| medicine_id (FK)   |        | reminder_time (TIME)     |
| scheduled_at (DT)  |        | day_of_week (TINYINT)    |
| status (ENUM)      |        +--------------------------+
| action_at          |
+--------------------+
```

### Constraints & Indexes
- `reminders` table features a composite unique key: `UNIQUE KEY (user_id, medicine_id, scheduled_at)` to eliminate duplicate reminder generation.
- Cascade deletions on foreign keys ensure that deleting a medicine cleanly clears associated reminder times and scheduled logs.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0 or later
- **npm**: v9.0 or later
- **MySQL**: (Optional for local testing; backend automatically provisions embedded storage if MySQL is offline).

### 1. Clone & Setup Environment

Copy the environment example file:
```bash
cp .env.example .env
```

If connecting to MySQL, update `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mediminder_db
```

### 2. Database Migration (MySQL)

You can import `database/schema.sql` directly into MySQL:
```bash
mysql -u root -p < database/schema.sql
```
*(Alternatively, starting the Node.js backend automatically runs the table DDL queries!)*

### 3. Start Backend Server

```bash
cd backend
npm install
npm run start
```
The backend server will run at: **`http://localhost:5000`**

### 4. Start Frontend Client

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will run at: **`http://localhost:5173`**

---

## 🧪 Pre-configured Test Account

| Field | Value |
|---|---|
| **Email** | `sarah@example.com` |
| **Password** | `Password123!` |

*(A 1-click "Autofill Demo Credentials" button is also provided directly on the Login page).*

---

## 📡 REST API Reference

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user account.
- `POST /api/auth/login` — Sign in and receive a JWT.
- `GET /api/auth/profile` — Fetch authenticated user profile.
- `PUT /api/auth/profile` — Update user name or timezone.

### Medicine Management Endpoints
- `POST /api/medicines` — Create a new medicine schedule with reminder times.
- `GET /api/medicines` — List all medicines for the logged-in user.
- `GET /api/medicines/:id` — Retrieve a specific medicine and its reminder times.
- `PUT /api/medicines/:id` — Update medicine details and schedule.
- `DELETE /api/medicines/:id` — Delete a medicine schedule.

### Reminder & Adherence Endpoints
- `GET /api/reminders/today` — Retrieve today's scheduled reminders for the user.
- `GET /api/reminders/upcoming` — Retrieve upcoming reminders.
- `PATCH /api/reminders/:id/status` — Mark reminder as `taken` or `skipped`.
- `GET /api/reminders/history` — Query medication compliance history with filters.
- `GET /api/reminders/stats` — Summary metrics for dashboard badges.

---

## 🔔 Testing Reminder Alerts

1. Log in to the application and navigate to the **Dashboard**.
2. Click **"Enable Desktop Alerts"** or the bell icon in the navigation bar to grant browser notification permissions.
3. Click the speaker icon to preview the medical chime sound.
4. Go to **"Add Medicine"**, set a reminder time 1 minute ahead of your current clock time, and click **Save**.
5. When the clock reaches the scheduled time, the **Medication Alert Modal** will pop up on your screen with audio chime and desktop notification!
6. Click **Mark Taken** to log the dose in your database and update the dashboard adherence metrics.

---

## 🛠️ Troubleshooting

- **Port 5000 or 5173 already in use**:
  Change `PORT` in `.env` or run Vite on a custom port (`npm run dev -- --port 5174`).
- **Browser notifications not appearing**:
  Ensure you clicked "Allow" when prompted by your browser. Check your operating system's "Do Not Disturb" / Focus assist settings.
- **MySQL connection error**:
  Ensure MySQL service is running on your computer. If MySQL is not running, the application smoothly runs using its high-fidelity local file fallback without interruption.
