import { HistoryRange } from './historyRange';
import { CodeSent, Valve, ValveCommand } from './Valve';

export interface ValveRepository {
  get(placeId: string): Promise<Valve>;

  requestCloseCode(): Promise<CodeSent>;

  close(placeId: string, code: string): Promise<ValveCommand>;

  open(placeId: string): Promise<ValveCommand>;

  getCommand(placeId: string, commandId: string): Promise<ValveCommand>;

  /** Without `range` the server returns the last 30 days. */
  listCommands(placeId: string, range?: HistoryRange): Promise<ValveCommand[]>;
}
