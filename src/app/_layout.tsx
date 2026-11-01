import { useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black_Italic } from '@expo-google-fonts/lato';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { CartProvider } from '../cart/CartProvider';
import { PermissionProvider } from '../permissions/PermissionProvider';
import { theme } from '../theme/theme';

// A direct /search link can still navigate back into the Home/Cart group.
export const unstable_settings = { initialRouteName: '(tabs)' };

/** Providers remain above the Stack: moving between tabs and Search never
 * resets cart state or repeats startup permission prompts. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Lato_400Regular, Lato_700Bold, Lato_900Black_Italic });
  const pathname = usePathname();
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.purple} /></View>;
  return <PermissionProvider><CartProvider>
    <StatusBar style={pathname === '/' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
    </Stack>
  </CartProvider></PermissionProvider>;
}
