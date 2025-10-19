import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('orgbuilder_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { token: receivedToken } = await loginRequest(username, password);
      setToken(receivedToken);
      localStorage.setItem('orgbuilder_token', receivedToken);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível autenticar.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('orgbuilder_token');
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      loading,
      error,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, loading, error]
  );

  useEffect(() => {
    setError(null);
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
