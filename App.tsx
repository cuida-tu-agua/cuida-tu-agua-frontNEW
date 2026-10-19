import React from 'react';
import { AppRegistry } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { AuthProvider } from './src/core/auth/AuthContext';
import { navigationRef } from './src/presentation/navigation/navigationRef';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { SplashScreen } from './src/presentation/screens/SplashScreen';
import { FONT_ASSETS } from './src/presentation/styles/fontAssets';
import { installFontPatch } from './src/presentation/styles/fonts';
import { ThemeBoundary, ThemeProvider, useAppTheme } from './src/presentation/theme/ThemeProvider';

// Every Text of the app uses the brand fonts (Manrope / IBM Plex Mono), whatever weight each screen asks for
installFontPatch();

/** The navigation library draws its own backgrounds and borders: it gets the colors of the current theme. */
const Root: React.FC<{ fontsReady: boolean }> = ({ fontsReady }) => {
  const { palette, dark, ready } = useAppTheme();

  // Until the saved theme and the fonts are known nothing is drawn with the wrong ones
  if (!ready || !fontsReady) return <SplashScreen />;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...DefaultTheme,
        dark,
        colors: {
          primary: palette.primary,
          background: palette.background,
          card: palette.surface,
          text: palette.textPrimary,
          border: palette.border,
          notification: palette.error,
        },
      }}
    >
      <ThemeBoundary>
        <RootNavigator />
      </ThemeBoundary>
    </NavigationContainer>
  );
};

export default function App() {
  // If a font fails to load (no network on web, for example) the app starts anyway with the system font
  const [loaded, error] = useFonts(FONT_ASSETS);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Root fontsReady={loaded || !!error} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('save-your-water', () => App);
