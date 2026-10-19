import { createNavigationContainerRef } from '@react-navigation/native';
import { MainStackParamList } from './types';

/**
 * Lets code OUTSIDE the stack (the side menu, later a push notification) open a screen.
 * It is only ready while the signed-in navigator is mounted: always check isReady() first.
 */
export const navigationRef = createNavigationContainerRef<MainStackParamList>();
