/**
 * AuthContext manages the user's authentication state by storing a token.
 * It provides functions for the user to register, log in, and log out.
 */

import { createContext, useContext, useState } from "react";

const API = import.meta.env.VITE_API;

const AuthContext = createContext();

/** Safely read JSON if present, otherwise return null. */
async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Safely get an error message from a response. */
async function getErrorMessage(response) {
  const text = await response.text();
  if (!text) return `Request failed (${response.status})`;

  try {
    const data = JSON.parse(text);
    return data.message || `Request failed (${response.status})`;
  } catch {
    return text;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  const register = async (credentials) => {
    const response = await fetch(API + "/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    // If not ok, do NOT call response.json() blindly
    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw Error(message);
    }

    // On success, try to parse JSON (token should be here)
    const result = await safeJson(response);
    if (!result?.token) {
      throw Error("Registration succeeded but no token was returned.");
    }

    setToken(result.token);
  };

  const login = async (credentials) => {
    const response = await fetch(API + "/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw Error(message);
    }

    const result = await safeJson(response);
    if (!result?.token) {
      throw Error("Login succeeded but no token was returned.");
    }

    setToken(result.token);
  };

  const logout = () => setToken(null);

  const value = { token, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within AuthProvider");
  return context;
}
