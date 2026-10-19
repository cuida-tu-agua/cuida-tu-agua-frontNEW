import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../core/auth/AuthContext';
import { isAdmin } from '../../domain/admin/Admin';
import { Logo } from '../components/common/Logo';
import { UnreadBadge } from '../components/notifications/NotificationBell';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { CONTENT_MAX_WIDTH, RAIL_WIDTH, SIDEBAR_WIDTH, shellModeFor, useLayout } from '../layout/breakpoints';
import { theme } from '../styles/theme';
import { themed } from '../styles/themeRuntime';
import { NavItem, NavSection, isAdminSection, navItemsFor, sectionOf, USER_DOOR } from './navItems';
import { navigationRef } from './navigationRef';

/** The section of the screen that is open now, kept in sync with the navigator. */
const useCurrentSection = (): NavSection | null => {
  const [section, setSection] = useState<NavSection | null>(null);

  useEffect(() => {
    const update = () => setSection(sectionOf(navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined));
    update();
    // The navigator mounts right after this component: look again once it is ready
    const timers = [setTimeout(update, 0), setTimeout(update, 300)];
    const unsubscribe = navigationRef.addListener('state', update);
    return () => {
      timers.forEach(clearTimeout);
      unsubscribe();
    };
  }, []);

  return section;
};

/** Frame of the signed-in app: it adds the menu around the screens and keeps the content in a centered column. */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { size } = useLayout();
  const mode = shellModeFor(size, Platform.OS);
  if (mode === 'none') return <>{children}</>;

  if (mode === 'topbar') {
    return (
      <View style={topRootStyle}>
        <TopBar />
        <View style={contentColumnStyle}>{children}</View>
      </View>
    );
  }

  return (
    <View style={rootStyle}>
      <SideMenu collapsed={mode === 'rail'} />
      <View style={contentOuterStyle}>
        <View style={contentColumnStyle}>{children}</View>
      </View>
    </View>
  );
};

/** Things the menus share: who is signed in, which items to show, how to open one. */
const useMenu = () => {
  const { user, logout } = useAuth();
  const section = useCurrentSection();
  const roles = user?.roles ?? [];
  const adminArea = isAdmin(roles) && isAdminSection(section);
  const items = navItemsFor(roles, section);
  const { count: unread } = useUnreadCount();

  const open = (route: NavItem['route']) => {
    if (!navigationRef.isReady()) return;
    // The menu is the top level: starting from the section's own screen avoids piling screens up on the stack
    navigationRef.reset({ index: 0, routes: [{ name: route } as never] });
  };

  return { user, logout, section, items, unread, open, adminArea, roleLabel: isAdmin(roles) ? 'Administrador' : 'Usuario' };
};

const Brand: React.FC<{ subtitle: string; compact?: boolean }> = ({ subtitle, compact }) => (
  <View style={brandStyle}>
    <Logo type="isotipo" theme="light" size={compact ? 36 : 40} />
    <View style={{ flexShrink: 1 }}>
      <Text style={brandTextStyle}>Cuida Tu Agua</Text>
      <Text style={brandSubStyle}>{subtitle}</Text>
    </View>
  </View>
);

const MenuItem: React.FC<{ item: NavItem; active: boolean; unread: number; onPress: () => void }> = ({ item, active, unread, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[itemStyle, active && itemActiveStyle]}
    accessibilityRole="menuitem"
    accessibilityLabel={item.label}
    accessibilityState={{ selected: active }}
  >
    <Ionicons name={item.icon} size={22} color={active ? theme.colors.primary : theme.colors.textSecondary} />
    <Text style={[itemTextStyle, active && itemTextActiveStyle, { flex: 1 }]}>{item.label}</Text>
    {item.section === 'notifications' && <UnreadBadge count={unread} />}
  </TouchableOpacity>
);

const UserBlock: React.FC<{ name: string; role: string; adminArea: boolean; onUserArea: () => void; onLogout: () => void }> = ({
  name,
  role,
  adminArea,
  onUserArea,
  onLogout,
}) => (
  <View style={footerStyle}>
    <View style={userStyle}>
      <Text style={userNameStyle} numberOfLines={1}>
        {name}
      </Text>
      <Text style={userRoleStyle}>{role}</Text>
    </View>
    {adminArea && (
      <TouchableOpacity onPress={onUserArea} style={linkStyle} accessibilityRole="link" accessibilityLabel={USER_DOOR.label}>
        <Ionicons name={USER_DOOR.icon} size={20} color={theme.colors.primary} />
        <Text style={linkTextStyle}>{USER_DOOR.label}</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity onPress={onLogout} style={linkStyle} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
      <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
      <Text style={logoutTextStyle}>Cerrar sesión</Text>
    </TouchableOpacity>
  </View>
);

const SideMenu: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { user, logout, section, items, unread, open, adminArea, roleLabel } = useMenu();

  if (collapsed) {
    // Tablet app: icons only
    return (
      <View style={[menuStyle, { width: RAIL_WIDTH, paddingHorizontal: theme.spacing.sm }]} accessibilityRole="menu">
        <View style={railBrandStyle}>
          <Logo type="isotipo" theme="light" size={40} />
        </View>
        <View style={itemsStyle}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => open(item.route)}
              style={[itemStyle, railItemStyle, item.section === section && itemActiveStyle]}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.section === section }}
            >
              <Ionicons name={item.icon} size={22} color={item.section === section ? theme.colors.primary : theme.colors.textSecondary} />
              {item.section === 'notifications' && <UnreadBadge count={unread} style={railBadgeStyle} />}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => void logout()} style={[itemStyle, railItemStyle]} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[menuStyle, { width: SIDEBAR_WIDTH }]} accessibilityRole="menu">
      <Brand subtitle={adminArea ? 'Panel administrador' : 'Mi cuenta'} />
      <View style={itemsStyle}>
        {items.map((item) => (
          <MenuItem key={item.route} item={item} active={item.section === section} unread={unread} onPress={() => open(item.route)} />
        ))}
      </View>
      {!!user && (
        <UserBlock
          name={`${user.firstName} ${user.lastName}`}
          role={roleLabel}
          adminArea={adminArea}
          onUserArea={() => open(USER_DOOR.route)}
          onLogout={() => void logout()}
        />
      )}
    </View>
  );
};

/** Web, narrow window: brand + ☰. The menu opens over the page, like the Figma "ventana angosta" board. */
const TopBar: React.FC = () => {
  const { user, logout, section, items, unread, open, adminArea, roleLabel } = useMenu();
  const [opened, setOpened] = useState(false);

  // Going to another screen (or the window growing) closes it
  useEffect(() => setOpened(false), [section]);

  const go = (route: NavItem['route']) => {
    setOpened(false);
    open(route);
  };

  return (
    <View style={topWrapStyle}>
      <View style={topBarStyle}>
        <Brand subtitle={adminArea ? 'Panel administrador' : 'Mi cuenta'} compact />
        <TouchableOpacity
          onPress={() => setOpened((value) => !value)}
          style={hamburgerStyle}
          accessibilityRole="button"
          accessibilityLabel={opened ? 'Cerrar menú' : unread > 0 ? `Abrir menú, ${unread} notificaciones sin leer` : 'Abrir menú'}
          accessibilityState={{ expanded: opened }}
        >
          <Ionicons name={opened ? 'close' : 'menu'} size={28} color={theme.colors.textPrimary} />
          {!opened && unread > 0 && <View style={hamburgerDotStyle} />}
        </TouchableOpacity>
      </View>

      {opened && (
        <>
          <Pressable style={scrimStyle} onPress={() => setOpened(false)} accessibilityLabel="Cerrar menú" />
          <View style={dropdownStyle} accessibilityRole="menu">
            {items.map((item) => (
              <MenuItem key={item.route} item={item} active={item.section === section} unread={unread} onPress={() => go(item.route)} />
            ))}
            {!!user && (
              <UserBlock
                name={`${user.firstName} ${user.lastName}`}
                role={roleLabel}
                adminArea={adminArea}
                onUserArea={() => go(USER_DOOR.route)}
                onLogout={() => {
                  setOpened(false);
                  void logout();
                }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const rootStyle: ViewStyle = themed(() => ({ flex: 1, flexDirection: 'row', backgroundColor: theme.colors.background }));
const topRootStyle: ViewStyle = themed(() => ({ flex: 1, backgroundColor: theme.colors.background }));

const contentOuterStyle: ViewStyle = themed(() => ({ flex: 1, alignItems: 'center', backgroundColor: theme.colors.background }));
const contentColumnStyle: ViewStyle = { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' };

const menuStyle: ViewStyle = themed(() => ({
  backgroundColor: theme.colors.surface,
  borderRightWidth: 1,
  borderRightColor: theme.colors.border,
  paddingVertical: theme.spacing.lg,
  paddingHorizontal: theme.spacing.md,
}));

const brandStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.sm,
  paddingBottom: theme.spacing.xl,
};
const railBrandStyle: ViewStyle = { alignItems: 'center', paddingBottom: theme.spacing.xl };
const brandTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.h2, fontSize: 17, lineHeight: 22, color: theme.colors.textPrimary }));
const brandSubStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 12, lineHeight: 16, color: theme.colors.textMuted }));

const itemsStyle: ViewStyle = { flex: 1, gap: theme.spacing.xs };
const itemStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.md,
  height: 46,
  borderRadius: theme.borderRadius.medium,
};
const railItemStyle: ViewStyle = { justifyContent: 'center', paddingHorizontal: 0 };
const railBadgeStyle: ViewStyle = { position: 'absolute', top: 4, right: 10 };
const itemActiveStyle: ViewStyle = themed(() => ({ backgroundColor: theme.colors.infoBg }));
const itemTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary }));
const itemTextActiveStyle: TextStyle = themed(() => ({ color: theme.colors.primary, fontWeight: '800' }));

const footerStyle: ViewStyle = themed(() => ({
  gap: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  paddingTop: theme.spacing.md,
  paddingHorizontal: theme.spacing.sm,
}));
const userStyle: ViewStyle = { gap: 2 };
const userNameStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '800', color: theme.colors.textPrimary }));
const userRoleStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 13, color: theme.colors.textMuted }));
const linkStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 36 };
const linkTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '800', color: theme.colors.primary }));
const logoutTextStyle: TextStyle = themed(() => ({ ...theme.textStyles.caption, fontSize: 15, fontWeight: '800', color: theme.colors.error }));

const topWrapStyle: ViewStyle = { zIndex: 20 };
const topBarStyle: ViewStyle = themed(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 56,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.sm,
  backgroundColor: theme.colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
}));
const hamburgerStyle: ViewStyle = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' };
const hamburgerDotStyle: ViewStyle = themed(() => ({
  position: 'absolute',
  top: 6,
  right: 6,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.colors.error,
  borderWidth: 2,
  borderColor: theme.colors.surface,
}));
const scrimStyle: ViewStyle = themed(() => ({
  position: 'absolute',
  top: 56,
  left: 0,
  right: 0,
  height: 4000,
  backgroundColor: theme.colors.overlay,
}));
const dropdownStyle: ViewStyle = themed(() => ({
  position: 'absolute',
  top: 56,
  left: 0,
  right: 0,
  gap: theme.spacing.xs,
  padding: theme.spacing.md,
  backgroundColor: theme.colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  ...theme.shadows.subtle,
}));
