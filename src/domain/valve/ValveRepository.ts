import { CodeSent, Valve, ValveCommand } from './Valve';

export interface ValveRepository {
  get(placeId: string): Promise<Valve>;

  requestCloseCode(): Promise<CodeSent>;

  close(placeId: string, code: string): Promise<ValveCommand>;

  open(placeId: string): Promise<ValveCommand>;

  getCommand(placeId: string, commandId: string): Promise<ValveCommand>;

  listCommands(placeId: string): Promise<ValveCommand[]>;
}
