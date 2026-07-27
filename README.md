# Swastik Medical Store - POS & Inventory Management System 💊

A modern, full-stack Point of Sale (POS) and Inventory Management web application designed specifically for medical stores and pharmacies. 



---

## ✨ Features

- **Dashboard**: Real-time overview of daily sales, total inventory count, and low-stock alerts.
- **Inventory Management**: Add, update, view, and delete medicines with details like batch number, expiry date, generic name, and manufacturer.
- **Billing & POS**: 
  - Add multiple medicines to a cart.
  - Automatically calculates subtotal, discounts, and net amounts.
  - Generates a beautifully formatted, printable Tax Invoice with "Amount in Words".
  - Automatically deducts sold quantities from the main inventory.
- **Sales History**: View past bills, search by customer name, and reprint past invoices.
- **User Management**: Role-based access control (Admin, Staff, Pharmacist, Cashier). Only admins can add or remove users.
- **Authentication**: Secure JWT-based login system with hashed passwords.

---

## 🛠️ Technology Stack

This project is built using the **MERN** stack:
- **Frontend**: React, Vite, React Router, Vanilla CSS (Glassmorphism UI), Lucide Icons.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js.
- **Database**: MongoDB (via Mongoose).
- **Deployment**: Configured out-of-the-box for [Vercel](https://vercel.com).

---

## 🚀 Local Development Setup

To run this project on your local computer, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v16 or higher).
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB server).

### 2. Clone the Repository
```bash
git clone https://github.com/codewith-uttam/medical-store.git
cd medical-store
```

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder and add your MongoDB connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/medical_store?retryWrites=true&w=majority
```
Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:5000
```
*(On the very first run, the backend will automatically create a default admin user).*

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file inside the `frontend` folder to point it to your local backend:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🔑 Default Login Credentials

Once the app is running, you can log in using the default admin account:
- **Username**: `admin`
- **Password**: `admin123`

*(It is highly recommended to create a new admin account and delete the default one for security reasons).*

---

## ☁️ Deployment to Vercel

This project includes specific configurations (`vercel.json`) to make deploying to Vercel seamless.

### Deploying the Backend
1. Go to your Vercel Dashboard and click **Add New Project**.
2. Import this repository.
3. Set the **Root Directory** to `backend`.
4. In the **Environment Variables** section, add your `MONGO_URI`.
5. Click **Deploy**.

> **Important MongoDB Note**: Ensure that your MongoDB Atlas Network Access (IP Allowlist) is set to `0.0.0.0/0` (Allow access from anywhere). Vercel uses dynamic IP addresses, so restricting IPs will cause the backend to crash!

### Deploying the Frontend
1. Go back to your Vercel Dashboard and click **Add New Project**.
2. Import this repository again.
3. Set the **Root Directory** to `frontend`.
4. In the **Environment Variables** section, add `VITE_API_URL` and set the value to your deployed Backend URL (e.g., `https://my-backend.vercel.app`).
5. Click **Deploy**.

---

## 📂 Folder Structure

```
medical-store/
│
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB connection logic
│   ├── models/
│   │   ├── Bill.js          # Mongoose schema for Sales/Invoices
│   │   ├── Medicine.js      # Mongoose schema for Inventory
│   │   └── User.js          # Mongoose schema for Authentication
│   ├── server.js            # Main Express API server & routes
│   ├── vercel.json          # Configuration for Vercel Serverless Functions
│   └── package.json         
│
├── frontend/
│   ├── public/              # Static assets (favicons, etc.)
│   ├── src/
│   │   ├── components/      # Reusable UI components (ProtectedRoute)
│   │   ├── pages/           # Main screens (Dashboard, Login, Billing, etc.)
│   │   ├── App.jsx          # Main layout, Navigation, and routing
│   │   ├── index.css        # Global CSS design system and variables
│   │   └── AuthContext.jsx  # Context Provider for global user state
│   ├── vite.config.js       # Vite bundler configuration
│   └── package.json         
│
└── README.md                # This file
```

---

*Created and maintained by [Swastik Infotech]()*
