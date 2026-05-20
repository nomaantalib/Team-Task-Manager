import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error fetching auth user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Helper for authorized API calls
  const authenticatedFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();

      // If token expired or invalid, auto-logout
      if (res.status === 401) {
        console.warn(`Auth expired on ${endpoint}. Logging out.`);
        logout();
        return { success: false, message: 'Session expired. Please log in again.' };
      }

      if (!res.ok && !data.success) {
        console.error(`API error on ${endpoint}:`, res.status, data);
      }

      return data;
    } catch (err) {
      console.error(`API Call failed on ${endpoint}:`, err.message, err);
      return { success: false, message: `Request failed: ${err.message}` };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
