import { GoalProgress } from './Goal';

/** HU-023/024: the goal of the CURRENT month of a place (ms-consumption). */
export interface GoalRepository {
  get(placeId: string, timeZone: string): Promise<GoalProgress>;

  /** Creates or edits the goal of the current month. Answers the new progress. */
  set(placeId: string, targetLiters: number, timeZone: string): Promise<GoalProgress>;
}
