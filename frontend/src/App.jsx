// 1. IMPORTING TOOLS AND PAGES
import React from 'react';
// These help us move between different pages without reloading the whole website (like a mobile app)
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
// These are little vector icons from the 'lucide-react' library
import { LayoutDashboard, Pill, ReceiptText, Activity, LogOut, UsersRound, FileText } from 'lucide-react';

// Importing all the different pages our app has
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import Sales from './pages/Sales';

// Importing the security system (Authentication)
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // This blocks logged-out users from seeing certain pages

// ==========================================
// 2. THE MAIN LAYOUT DESIGN (AppLayout)
// ==========================================
// This component draws the basic skeleton of the app: The Sidebar on the left, and a blank space on the right where the pages load.
function AppLayout() {
  const { logout, user } = useAuth(); // Get the current logged-in user, and the ability to log out
  const navigate = useNavigate();     // Allows us to redirect the user to a different page

  // What happens when someone clicks "Logout"?
  const handleLogout = () => {
    logout();             // 1. Delete their digital ID card
    navigate('/login');   // 2. Send them back to the login screen
  };

  return (
    <div className="app-container">
      
      {/* ─── THE LEFT SIDEBAR ─── */}
      <aside className="sidebar">
        
        {/* The Top Logo Area */}
        <div className="sidebar-logo">
          <Activity size={32} color="#f59e0b" />
          <span>Swastik Medical</span>
        </div>

        {/* The Navigation Buttons (Links) */}
        <nav className="nav-links">
          
          {/* NavLink automatically turns orange ("active") when we are on that exact page */}
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          
          <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Pill size={20} />
            Inventory
          </NavLink>
          
          <NavLink to="/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ReceiptText size={20} />
            Billing
          </NavLink>
          
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UsersRound size={20} />
            Users
          </NavLink>
          
          <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Sales
          </NavLink>
        </nav>

        {/* The Bottom Section (Username & Logout) */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(245,158,11,0.1)' }}>
          {/* If a user is logged in, show their username */}
          {user && (
            <p style={{ fontSize: '13px', color: '#a8927a', marginBottom: '10px', paddingLeft: '4px' }}>
              Signed in as <strong style={{ color: '#fef3e2' }}>{user.username}</strong>
            </p>
          )}
          
          {/* The Logout Button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', textAlign: 'left' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── THE MAIN CONTENT AREA (Right Side) ─── */}
      <main className="main-content">
        {/* The <Routes> tag looks at the URL in the browser (like "/billing") and loads the correct Page inside this area */}
        <Routes>
          {/* ProtectedRoute acts like a security guard. If you aren't logged in, it kicks you to the login screen! */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

// ==========================================
// 3. THE MASTER APP COMPONENT
// ==========================================
// This is the absolute core of the React app. Everything starts here.
function App() {
  return (
    // AuthProvider wraps the whole app, giving every page access to check if the user is logged in or not.
    <AuthProvider>
      {/* Router controls reading the website address (URLs) */}
      <Router>
        <Routes>
          {/* The Login page is standalone. It doesn't have the sidebar or top bar. */}
          <Route path="/login" element={<Login />} />
          
          {/* For ANY OTHER URL ("/*"), show the AppLayout (which has the sidebar and the secure pages inside it). */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

