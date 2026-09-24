import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { useAuth } from '../../core/auth/AuthContext';

export const MainNavigator: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <DashboardScreen userName={user?.email || 'Usuario'} />
      <View style={styles.footer}>
        <Button title="Logout" onPress={logout} color="#0096C7" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});