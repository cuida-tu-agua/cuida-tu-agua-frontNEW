import { Valve } from './Valve';

/**
 * HU-029: "offers direct access to the close-valve action". The alert opens the place dashboard with
 * openCloseValve = true; the dashboard then shows the close dialog straight away, but only if closing
 * still makes sense (valve open and no order already waiting). Otherwise the user just sees the dashboard.
 */
export const shouldOpenCloseDialog = (requested: boolean | undefined, valve: Valve | null): boolean =>
  requested === true && valve !== null && valve.state === 'OPEN' && valve.pendingCommand === null;
