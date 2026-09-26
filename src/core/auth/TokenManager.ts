import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;        // user ID
  email: string;
  roles: string[];
  exp: number;        // expiration timestamp (segundos)
  iat: number;        // issued at timestamp
}

class TokenManagerClass {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutos en ms

  /**
   * Guarda los tokens en almacenamiento seguro
   * @param accessToken - JWT para requests
   * @param refreshToken - JWT para renovar (opcional)
   */
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken);
      console.log('AccessToken guardado');

      if (refreshToken) {
        await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken);
        console.log('RefreshToken guardado');
      }
    } catch (error) {
      console.error('Error guardando tokens:', error);
      throw error;
    }
  }

  /**
   * Obtiene el access token actual
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Decodifica el token para leer claims (sin verificar firma)
   * @param token - JWT string
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Token decodificado:', {
        user: decoded.sub,
        email: decoded.email,
        roles: decoded.roles,
        expiresIn: new Date(decoded.exp * 1000),
      });
      return decoded;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Valida si el token es válido y no está cerca de expirar
   */
  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      console.log(' No hay token almacenado');
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded) {
      console.log('Token no se puede decodificar');
      return false;
    }

    const now = Date.now();
    const expiresAt = decoded.exp * 1000; // convertir a ms
    const timeUntilExpiry = expiresAt - now;

    console.log(`Token expira en: ${Math.round(timeUntilExpiry / 1000 / 60)} minutos`);

    if (timeUntilExpiry <= 0) {
      console.log('Token expirado');
      return false;
    }

    if (timeUntilExpiry < this.TOKEN_EXPIRY_BUFFER) {
      console.log(' Token próximo a expirar, necesita refresh');
      return false;
    }

    console.log('Token válido');
    return true;
  }

  /**
   * Borra los tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
      console.log('Tokens eliminados (logout)');
    } catch (error) {
      console.error('Error eliminando tokens:', error);
    }
  }

  /**
   * Obtiene datos del usuario desde el token decodificado
   */
  async getUserData(): Promise<{ userId: string; email: string; roles: string[] } | null> {
    const token = await this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
    };
  }
}

// Singleton: una sola instancia en toda la app
export const tokenManager = new TokenManagerClass();