import { navItemsFor, sectionOf } from '../../navigation/navItems';
import { BREAKPOINTS, columnsFor, contentWidthFor, layoutFor, shellModeFor } from '../breakpoints';

describe('layoutFor: the width decides the layout, on any platform', () => {
  it('phone, tablet and desktop widths', () => {
    expect(layoutFor(360)).toBe('compact');
    expect(layoutFor(767)).toBe('compact');
    expect(layoutFor(BREAKPOINTS.medium)).toBe('medium');
    expect(layoutFor(1023)).toBe('medium');
    expect(layoutFor(BREAKPOINTS.expanded)).toBe('expanded');
    expect(layoutFor(1920)).toBe('expanded');
  });

  it('the room for content is the window minus the menu, never wider than the column', () => {
    expect(contentWidthFor(390)).toBe(390);           // phone: all of it
    expect(contentWidthFor(900)).toBe(900 - 76);      // tablet: icon rail
    expect(contentWidthFor(1100)).toBe(1100 - 248);   // desktop: full menu
    expect(contentWidthFor(2560)).toBe(1120);         // big monitor: centered column
  });

  it('cards per row follow the room, so a card never gets narrower than it can read', () => {
    expect(columnsFor(contentWidthFor(390))).toBe(1);
    expect(columnsFor(contentWidthFor(820))).toBe(2);    // tablet
    expect(columnsFor(contentWidthFor(1100))).toBe(2);   // small desktop window
    expect(columnsFor(contentWidthFor(1440))).toBe(3);   // normal desktop
    expect(columnsFor(contentWidthFor(2560))).toBe(3);
  });
});

describe('side menu', () => {
  it('lists the places, the inbox, the favorite tips and the profile for a normal user', () => {
    expect(navItemsFor(['USER']).map((i) => i.route)).toEqual(['Places', 'Notifications', 'Tips', 'Profile']);
  });

  it('administrators get a door to the administration in the user menu', () => {
    expect(navItemsFor(['USER', 'ADMIN']).map((i) => i.route)).toEqual(['Places', 'Notifications', 'Tips', 'Profile', 'AdminMetrics']);
  });

  it('the administration has its own menu: summary, users and tips', () => {
    expect(navItemsFor(['USER', 'ADMIN'], 'adminUsers').map((i) => i.route)).toEqual(['AdminMetrics', 'AdminUsers', 'AdminTips']);
  });

  it('a normal user never gets the administration menu, whatever the section', () => {
    expect(navItemsFor(['USER'], 'adminUsers').map((i) => i.route)).toEqual(['Places', 'Notifications', 'Tips', 'Profile']);
  });

  it('lights the parent item for sub-screens', () => {
    expect(sectionOf('PlaceDashboard')).toBe('places');
    expect(sectionOf('ValveHistory')).toBe('places');
    expect(sectionOf('ChangePassword')).toBe('profile');
    expect(sectionOf('NotificationPreferences')).toBe('notifications');
    expect(sectionOf('AdminUsers')).toBe('adminUsers');
    expect(sectionOf('PlaceTariff')).toBe('places');
    expect(sectionOf('Tips')).toBe('tips');
    expect(sectionOf('AdminTips')).toBe('adminTips');
    expect(sectionOf('Nope')).toBeNull();
    expect(sectionOf(undefined)).toBeNull();
  });
});

describe('shell mode: how the menu is drawn', () => {
  it('web: side menu when wide, a top bar with the menu button when narrower', () => {
    expect(shellModeFor('expanded', 'web')).toBe('sidebar');
    expect(shellModeFor('medium', 'web')).toBe('topbar');
    expect(shellModeFor('compact', 'web')).toBe('topbar');
  });

  it('phone / tablet app: nothing on a phone, an icon rail on a tablet, side menu on a big one', () => {
    expect(shellModeFor('compact', 'android')).toBe('none');
    expect(shellModeFor('medium', 'ios')).toBe('rail');
    expect(shellModeFor('expanded', 'android')).toBe('sidebar');
  });
});
