import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('med_token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('med_user');
    return u ? JSON.parse(u) : null;
  });

  const login = (token, userData) => {
    localStorage.setItem('med_token', token);
    localStorage.setItem('med_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('med_token');
    localStorage.removeItem('med_user');
    setToken(null);
    setUser(null);
  };

  // Helper: return Authorization header object
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
