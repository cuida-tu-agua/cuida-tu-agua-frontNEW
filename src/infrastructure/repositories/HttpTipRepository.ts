import { AxiosInstance } from 'axios';
import { TIP_ENDPOINTS } from '../../config/api';
import { AdminTip, Tip, TipCategory, TipInput, TipQuery, TipsSession } from '../../domain/tips/Tip';
import { AdminTipRepository, TipRepository } from '../../domain/tips/TipRepository';
import { toAppError } from '../http/httpError';

export class HttpTipRepository implements TipRepository, AdminTipRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  // ── HU-065 ───────────────────────────────────────────────────────────

  async session(query: TipQuery = {}): Promise<TipsSession> {
    try {
      const { data } = await this.http.get<TipsSession>(TIP_ENDPOINTS.TIPS, {
        params: { placeId: query.placeId, category: query.category, count: query.count },
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async favorites(): Promise<Tip[]> {
    try {
      const { data } = await this.http.get<Tip[]>(TIP_ENDPOINTS.FAVORITES);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async mark(tipId: string): Promise<Tip> {
    try {
      const { data } = await this.http.put<Tip>(TIP_ENDPOINTS.FAVORITE(tipId));
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async unmark(tipId: string): Promise<void> {
    try {
      await this.http.delete(TIP_ENDPOINTS.FAVORITE(tipId));
    } catch (error) {
      throw toAppError(error);
    }
  }

  // ── HU-063 / HU-064 (administrator) ──────────────────────────────────

  async list(category?: TipCategory | null, includeInactive = true): Promise<AdminTip[]> {
    try {
      const { data } = await this.http.get<AdminTip[]>(TIP_ENDPOINTS.ADMIN, {
        params: { category: category ?? undefined, includeInactive },
      });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async create(input: TipInput): Promise<AdminTip> {
    try {
      const { data } = await this.http.post<AdminTip>(TIP_ENDPOINTS.ADMIN, input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async edit(tipId: string, input: TipInput): Promise<AdminTip> {
    try {
      const { data } = await this.http.put<AdminTip>(TIP_ENDPOINTS.ADMIN_TIP(tipId), input);
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  async setActive(tipId: string, active: boolean): Promise<AdminTip> {
    try {
      const { data } = await this.http.put<AdminTip>(TIP_ENDPOINTS.ADMIN_ACTIVE(tipId), { active });
      return data;
    } catch (error) {
      throw toAppError(error);
    }
  }
}
