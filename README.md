# Swastik Medical Store Management System 🏥

A complete, full-stack Medical Store (Pharmacy) management system built with React and Node.js. This application allows medical shop owners to manage their inventory, generate bills with beautiful A4 printable invoices, track daily sales, and manage staff user accounts.

---

## 🌟 Features

- **📊 Dashboard**: Get a quick overview of today's total sales, total medicines in stock, and low-stock alerts.
- **💊 Inventory Management**: Add, edit, and delete medicines. Track batch numbers, expiry dates, and manufacturer details.
- **🧾 Billing & Checkout**: Add medicines to a cart, apply discounts, and process checkouts. Automatically deducts sold items from inventory.
- **🖨️ A4 Invoice Printing**: Generate clean, professional A4 invoices that open in a dedicated print window (includes automatic amount-to-words conversion for Indian Rupees).
- **📈 Sales History**: View a history of all past bills and reprint invoices at any time.
- **👥 User Management**: Role-based access control. The admin can create staff accounts and change passwords. Secure authentication using JWT and bcrypt.
- **🎨 Beautiful UI**: A modern, dark-themed UI with glassmorphism effects and fully responsive design.

---

## 🛠️ Technology Stack

- **Frontend**: React (using Vite), React Router, Lucide React (for icons)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (Lightweight, file-based database—no complex setup required!)
- **Security**: JSON Web Tokens (JWT) for session management, bcryptjs for password hashing.

---

## 🚀 Getting Started (How to Run the Project)

This project has two parts: the **Backend** (Server/Database) and the **Frontend** (React App). You need to run both simultaneously.

### 1. Start the Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *(The server will run on `http://localhost:5000` and automatically create the `store.db` SQLite database).*

### 2. Start the Frontend

1. Open a **new** terminal (keep the backend terminal running) and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the link shown in the terminal (usually `http://localhost:5173`).

---

## 🔐 Default Login Credentials

When you run the backend for the first time, it automatically creates a default Admin account:

- **Username**: `admin`
- **Password**: `admin123`

*(It is highly recommended to change this password or create a new admin account via the User Management panel after your first login!)*

---

## 📂 Folder Structure

```
medical store/
│
├── backend/
│   ├── database.js     # Sets up the SQLite tables (Medicines, Bills, Users)
│   ├── server.js       # The Express API server (handles login, data fetching)
│   ├── store.db        # The actual database file (auto-generated)
│   └── package.json    # Backend dependencies
│
├── frontend/
│   ├── public/         # Static assets (like background images)
│   ├── src/
│   │   ├── components/ # Reusable UI components (ProtectedRoute)
│   │   ├── pages/      # Main screens (Dashboard, Login, Billing, etc.)
│   │   ├── App.jsx     # Main layout and routing setup
│   │   ├── index.css   # Global styles and custom CSS design system
│   │   └── AuthContext # Manages user login state across the app
│   └── package.json    # Frontend dependencies
│
└── README.md           # This file
```

---

*Created by Swastik Infotech*
