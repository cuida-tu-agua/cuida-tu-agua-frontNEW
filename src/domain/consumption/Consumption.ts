export type ConsumptionPeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface ConsumptionBucket {
  start: string;
  liters: number;
}

export interface Consumption {
  placeId: string;
  period: ConsumptionPeriod;
  timeZone: string;
  from: string;
  to: string;
  totalLiters: number;
  hasData: boolean;
  buckets: ConsumptionBucket[];
  lastReadingAt: string | null;
  currentFlowLpm: number | null;
  generatedAt: string;
}
