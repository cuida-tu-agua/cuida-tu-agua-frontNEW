import { AxiosInstance } from 'axios';
import { PROFILE_ENDPOINTS, VALVE_ENDPOINTS } from '../../config/api';
import { HistoryRange } from '../../domain/valve/historyRange';
import { CodeSent, Valve, ValveCommand } from '../../domain/valve/Valve';
import { ValveRepository } from '../../domain/valve/ValveRepository';
import { toAppError } from '../http/httpError';

export const VALVE_CLOSE_ACTION = 'VALVE_CLOSE';

export class HttpValveRepository implements ValveRepository {
  private readonly valveHttp: AxiosInstance;
  private readonly iamHttp: AxiosInstance;

  constructor(valveHttp: AxiosInstance, iamHttp: AxiosInstance) {
    this.valveHttp = valveHttp;
    this.iamHttp = iamHttp;
  }

  private async call<T>(request: () => Promise<{ data: T }>): Promise<T> {
    try {
      return (await request()).data;
    } catch (error) {
      throw toAppError(error);
    }
  }

  get(placeId: string): Promise<Valve> {
    return this.call(() => this.valveHttp.get<Valve>(VALVE_ENDPOINTS.VALVE(placeId)));
  }

  requestCloseCode(): Promise<CodeSent> {
    return this.call(() => this.iamHttp.post<CodeSent>(PROFILE_ENDPOINTS.ACTION_CODES, { action: VALVE_CLOSE_ACTION }));
  }

  close(placeId: string, code: string): Promise<ValveCommand> {
    return this.call(() => this.valveHttp.post<ValveCommand>(VALVE_ENDPOINTS.CLOSE(placeId), { code }));
  }

  open(placeId: string): Promise<ValveCommand> {
    return this.call(() => this.valveHttp.post<ValveCommand>(VALVE_ENDPOINTS.OPEN(placeId)));
  }

  getCommand(placeId: string, commandId: string): Promise<ValveCommand> {
    return this.call(() => this.valveHttp.get<ValveCommand>(VALVE_ENDPOINTS.COMMAND(placeId, commandId)));
  }

  listCommands(placeId: string, range?: HistoryRange): Promise<ValveCommand[]> {
    return this.call(() =>
      this.valveHttp.get<ValveCommand[]>(VALVE_ENDPOINTS.COMMANDS(placeId), range ? { params: { from: range.from, to: range.to } } : undefined),
    );
  }
}
