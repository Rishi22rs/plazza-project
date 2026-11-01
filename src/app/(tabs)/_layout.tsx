import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

/** Route group keeps Home/Cart tabs separate from the full-screen search route.
 * Parentheses in the folder name do not change the public / and /cart URLs. */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottomSpace = Math.max(insets.bottom, 8);
  const labelSpace = Math.max(0, fontScale - 1) * 20;
  return (
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
  );
}
