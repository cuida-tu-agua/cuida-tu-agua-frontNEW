import React, { useEffect, useState } from 'react';
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../core/auth/AuthContext';
import { avatarUri } from '../../config/api';
import { Avatar } from '../components/common/Avatar';
import { Logo } from '../components/common/Logo';
import { UnreadBadge } from '../components/notifications/NotificationBell';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { CONTENT_MAX_WIDTH, RAIL_WIDTH, SIDEBAR_WIDTH, useLayout } from '../layout/breakpoints';
import { theme } from '../styles/theme';
import { NavSection, navItemsFor, sectionOf } from './navItems';
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

/**
 * Frame of the signed-in app. On a phone (compact) it adds nothing: the stack navigator is the whole screen.
 * On a tablet / desktop it adds the side menu and keeps the content in a centered column.
 */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { size } = useLayout();
  if (size === 'compact') return <>{children}</>;

  return (
    <View style={rootStyle}>
      <SideMenu collapsed={size === 'medium'} />
      <View style={contentOuterStyle}>
        <View style={contentColumnStyle}>{children}</View>
      </View>
    </View>
  );
};

const SideMenu: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const section = useCurrentSection();
  const items = navItemsFor(user?.roles ?? []);
  const { count: unread } = useUnreadCount();

  const open = (route: (typeof items)[number]['route']) => {
    if (!navigationRef.isReady()) return;
    // The menu is the top level: starting from the section's own screen avoids piling screens up on the stack
    navigationRef.reset({ index: 0, routes: [{ name: route } as never] });
  };

  return (
    <View style={[menuStyle, { width: collapsed ? RAIL_WIDTH : SIDEBAR_WIDTH }]} accessibilityRole="menu">
      <View style={[brandStyle, collapsed && brandCollapsedStyle]}>
        <Logo type="isotipo" theme="light" size={collapsed ? 40 : 44} />
        {!collapsed && <Text style={brandTextStyle}>Cuida Tu Agua</Text>}
      </View>

      <View style={itemsStyle}>
        {items.map((item) => {
          const active = item.section === section;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => open(item.route)}
              style={[itemStyle, collapsed && itemCollapsedStyle, active && itemActiveStyle]}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
            >
              <Ionicons name={item.icon} size={22} color={active ? theme.colors.primary : theme.colors.textSecondary} />
              {!collapsed && <Text style={[itemTextStyle, active && itemTextActiveStyle, { flex: 1 }]}>{item.label}</Text>}
              {item.section === 'notifications' && <UnreadBadge count={unread} style={collapsed ? railBadgeStyle : undefined} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={footerStyle}>
        {!!user && (
          <View style={[userStyle, collapsed && userCollapsedStyle]}>
            <Avatar uri={avatarUri(user.avatarUrl)} firstName={user.firstName} lastName={user.lastName} size={36} />
            {!collapsed && (
              <View style={{ flex: 1 }}>
                <Text style={userNameStyle} numberOfLines={1}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={userMailStyle} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            )}
          </View>
        )}
        <TouchableOpacity
          onPress={() => void logout()}
          style={[itemStyle, collapsed && itemCollapsedStyle]}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.textSecondary} />
          {!collapsed && <Text style={itemTextStyle}>Cerrar sesión</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const rootStyle: ViewStyle = { flex: 1, flexDirection: 'row', backgroundColor: theme.colors.background };

const contentOuterStyle: ViewStyle = { flex: 1, alignItems: 'center', backgroundColor: theme.colors.background };
const contentColumnStyle: ViewStyle = { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH };

const menuStyle: ViewStyle = {
  backgroundColor: theme.colors.surface,
  borderRightWidth: 1,
  borderRightColor: theme.colors.border,
  paddingVertical: theme.spacing.lg,
  paddingHorizontal: theme.spacing.md,
};

const brandStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.sm,
  paddingBottom: theme.spacing.xl,
};
const brandCollapsedStyle: ViewStyle = { justifyContent: 'center', paddingHorizontal: 0 };
const brandTextStyle: TextStyle = { ...theme.textStyles.h2, fontSize: 18, color: theme.colors.textPrimary, flexShrink: 1 };

const itemsStyle: ViewStyle = { flex: 1, gap: theme.spacing.xs };
const itemStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing.md,
  paddingHorizontal: theme.spacing.md,
  height: 46,
  borderRadius: theme.borderRadius.medium,
};
const railBadgeStyle: ViewStyle = { position: 'absolute', top: 4, right: 10 };
const itemCollapsedStyle: ViewStyle = { justifyContent: 'center', paddingHorizontal: 0 };
const itemActiveStyle: ViewStyle = { backgroundColor: theme.colors.infoBg };
const itemTextStyle: TextStyle = { ...theme.textStyles.caption, fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary };
const itemTextActiveStyle: TextStyle = { color: theme.colors.primary, fontWeight: '800' };

const footerStyle: ViewStyle = {
  gap: theme.spacing.sm,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  paddingTop: theme.spacing.md,
};
const userStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.sm };
const userCollapsedStyle: ViewStyle = { justifyContent: 'center', paddingHorizontal: 0 };
const userNameStyle: TextStyle = { ...theme.textStyles.caption, fontWeight: '800', color: theme.colors.textPrimary };
const userMailStyle: TextStyle = { ...theme.textStyles.label, color: theme.colors.textMuted };
