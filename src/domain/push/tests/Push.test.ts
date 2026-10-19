import { pushTapTarget } from '../Push';

describe('pushTapTarget', () => {
  it('always lands in the inbox and keeps the notification id', () => {
    expect(pushTapTarget({ notificationId: 'n1', placeId: 'p1', type: 'ValveChanged' })).toEqual({
      route: 'Notifications',
      notificationId: 'n1',
    });
  });

  it.each([[undefined], [null], [{}], ['text'], [{ notificationId: 42 }]])('a push without a usable id (%p) still opens the inbox', (data) => {
    expect(pushTapTarget(data)).toEqual({ route: 'Notifications', notificationId: undefined });
  });
});
