// src/core/http/ApiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api';
import { TokenManager } from '@/core/auth/TokenManager';

class ApiClientClass {
  private client: AxiosInstance;
  private tokenManager: TokenManager;

  constructor() {
    // Crear instancia de axios con configuración
    this.client = axios.create(API_CONFIG);
    this.tokenManager = new TokenManager();

    // Configurar interceptores
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        // Obtener token del storage
        const token = await this.tokenManager.getToken();

        // Si hay token, añadirlo al header Authorization
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      // Respuesta exitosa (200-299)
      (response) => response,

      // Respuesta con error (400+)
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Si recibimos 401 (token expirado)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Intentar renovar el token
            await this.tokenManager.refreshToken();

            // Reintentar el request original con token nuevo
            return this.client(originalRequest);
          } catch (refreshError) {
            // Si no se puede renovar, logout
            console.error('No se pudo renovar token:', refreshError);
            // TODO: Disparar acción de logout
            return Promise.reject(refreshError);
          }
        }

        // Para otros errores, simplemente rechazar
        return Promise.reject(error);
      }
    );
  }


  public async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }


  public getClient(): AxiosInstance {
    return this.client;
  }
}

// Exportar instancia única (Singleton)
export const apiClient = new ApiClientClass();