import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tokenManager } from './TokenManager';

export interface User {
  userId: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verifica si hay sesión guardada al iniciar la app
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Verificando sesión guardada...');

      const isValid = await tokenManager.isTokenValid();

      if (isValid) {
        const userData = await tokenManager.getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log('Sesión válida, usuario:', userData.email);
        }
      } else {
        console.log('Sesión inválida o expirada');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error(' Error verificando sesión:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Iniciando login para:', email);

      // 1. Llamar API
      const response = await fetch('http://192.168.20.180:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login fallido');
      }

      const data = await response.json();
      console.log('Login exitoso, token recibido');

      // 2. Guardar token
      await tokenManager.setTokens(data.accessToken, data.refreshToken);

      // 3. Obtener datos del usuario
      const userData = await tokenManager.getUserData();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Usuario autenticado:', userData.email);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        console.log('Registrando usuario:', email);

        // 1. Llamar API
        const response = await fetch('http://192.168.20.180:8081/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registro fallido');
        }

        const data = await response.json();
        console.log('Registro exitoso');

        // 2. Auto-login después de registro (opcional)
        if (data.accessToken) {
          await tokenManager.setTokens(data.accessToken, data.refreshToken);
          const userData = await tokenManager.getUserData();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error en registro:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      console.log('Haciendo logout...');
      await tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      console.log('Logout exitoso');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para acceder al contexto de auth desde cualquier pantalla
 * Uso: const { user, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};