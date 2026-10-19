import { AdminTip, Tip, TipCategory, TipInput, TipQuery, TipsSession } from './Tip';

export interface TipRepository {
  /** HU-065: the tips of one session, for a place, a category or the selected place of the user. */
  session(query?: TipQuery): Promise<TipsSession>;
  favorites(): Promise<Tip[]>;
  mark(tipId: string): Promise<Tip>;
  unmark(tipId: string): Promise<void>;
}

export interface AdminTipRepository {
  /** HU-063 / HU-064 */
  list(category?: TipCategory | null, includeInactive?: boolean): Promise<AdminTip[]>;
  create(input: TipInput): Promise<AdminTip>;
  edit(tipId: string, input: TipInput): Promise<AdminTip>;
  setActive(tipId: string, active: boolean): Promise<AdminTip>;
}
