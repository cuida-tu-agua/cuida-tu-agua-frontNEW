import { AppState } from 'react-native';

/**
 * Runs `run` every time the app (phone) or the browser tab comes back to the foreground. While it is hidden the
 * timers are slowed down by the system, so the data on screen may be minutes old: this refreshes it at once.
 * @returns the function that stops listening (call it in the cleanup of the effect).
 */
export const onForeground = (run: () => void): (() => void) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') run();
  });
  return () => subscription.remove();
};
