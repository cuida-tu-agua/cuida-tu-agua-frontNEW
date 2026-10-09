/**
 * Tiny "the number of unread notifications may have changed" signal. The inbox emits it after it marks something
 * as read; the bell (and the side menu badge) listen and ask for the new number right away, instead of waiting
 * for their next poll. Later a push that arrives while the app is open will emit it too.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export const notifyUnreadChanged = (): void => {
  listeners.forEach((listener) => listener());
};

export const onUnreadChanged = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
