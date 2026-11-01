import { useFonts, Lato_400Regular, Lato_700Bold, Lato_900Black_Italic } from '@expo-google-fonts/lato';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme/theme';
import { PermissionProvider } from '../permissions/PermissionProvider';
import { CartProvider } from '../cart/CartProvider';

/**
 * Expo Router reads this layout before rendering index.tsx or cart.tsx.
 * Tabs owns navigation state, Android back behavior, and selected-tab semantics.
 * Screen files contain UI; they do not implement their own navigation system.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Lato_400Regular, Lato_700Bold, Lato_900Black_Italic });
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { fontScale } = useWindowDimensions();

  // Reserve space for the OS gesture area and enlarged accessibility labels.
  // minHeight on tab buttons preserves comfortable targets on small phones.
  const bottomSpace = Math.max(insets.bottom, 8);
  const labelSpace = Math.max(0, fontScale - 1) * 20;

  // Fonts are packaged with the app; loading does not require a network request.
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.purple} /></View>;

  return (
    <PermissionProvider>
    <CartProvider>
    {/* One status-bar owner avoids inactive mounted tabs overriding its color. */}
    <StatusBar style={pathname === '/cart' ? 'dark' : 'light'} />
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: '#888888',
      tabBarHideOnKeyboard: true,
      tabBarLabelPosition: 'below-icon',
      tabBarAllowFontScaling: true,
      tabBarStyle: {
        backgroundColor: theme.colors.white,
        borderTopColor: '#EEEEEE',
        height: 64 + bottomSpace + labelSpace,
        paddingBottom: bottomSpace,
      },
      tabBarItemStyle: { minHeight: 56, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarAccessibilityLabel: 'Home, medicine search',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={25} color={typeof color === 'string' ? color : theme.colors.primary} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Cart',
        tabBarAccessibilityLabel: 'Cart',
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bag' : 'bag-outline'} size={26} color={typeof color === 'string' ? color : theme.colors.primary} />,
      }} />
    </Tabs>
    </CartProvider>
    </PermissionProvider>
  );
}
