import { AxiosInstance } from 'axios';
import { CONSUMPTION_ENDPOINTS } from '../../config/api';
import { GoalProgress } from '../../domain/goals/Goal';
import { GoalRepository } from '../../domain/goals/GoalRepository';
import { toAppError } from '../http/httpError';

const orNull = (value: number | string | null | undefined): number | null =>
  value === null || value === undefined ? null : Number(value);

/** The decimals of SQL Server may arrive as 9500.000: always numbers for the app. */
const normalize = (data: GoalProgress): GoalProgress => ({
  ...data,
  consumedLiters: Number(data.consumedLiters),
  targetLiters: orNull(data.targetLiters),
  percentage: orNull(data.percentage),
  remainingLiters: orNull(data.remainingLiters),
});

/** Adapter: GoalRepository over HTTP (ms-consumption, through the gateway /consumption). */
export class HttpGoalRepository implements GoalRepository {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async get(placeId: string, timeZone: string): Promise<GoalProgress> {
    try {
      const { data } = await this.http.get<GoalProgress>(CONSUMPTION_ENDPOINTS.PLACE_GOAL(placeId), { params: { tz: timeZone } });
      return normalize(data);
    } catch (error) {
      throw toAppError(error);
    }
  }

  async set(placeId: string, targetLiters: number, timeZone: string): Promise<GoalProgress> {
    try {
      const { data } = await this.http.put<GoalProgress>(
        CONSUMPTION_ENDPOINTS.PLACE_GOAL(placeId),
        { targetLiters },
        { params: { tz: timeZone } },
      );
      return normalize(data);
    } catch (error) {
      throw toAppError(error);
    }
  }
}
