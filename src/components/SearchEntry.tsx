import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { theme } from '../theme/theme';

const PROMPTS = ['Search for medicine', 'Search for food', 'Search for vitamins', 'Search for health essentials'];

/** Home has a navigation button that looks like a search field, not a TextInput.
 * Only SearchScreen owns typing and history; this control never opens a keyboard. */
export function SearchEntry() {
  const pathname = usePathname();
  const { fontScale } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [progress] = useState(() => new Animated.Value(0));
  const lineHeight = Math.ceil(24 * Math.max(1, fontScale));

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  // Reset before paint after advancing the text, avoiding a visible jump back
  // to the outgoing phrase. The new phrase occupies the same final position.
  useLayoutEffect(() => { progress.setValue(0); }, [index, progress]);

  useEffect(() => {
    if (reducedMotion || pathname !== '/') return;
    const animation = Animated.timing(progress, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
    const timer = setTimeout(() => animation.start(({ finished }) => {
      if (finished) setIndex(previous => (previous + 1) % PROMPTS.length);
    }), 2500);
    // Stop timers/native motion while Search is open or the component unmounts.
    return () => { clearTimeout(timer); animation.stop(); progress.setValue(0); };
  }, [index, pathname, reducedMotion, progress]);

  return <Pressable accessibilityRole="button" accessibilityLabel="Open medicine search" onPress={() => router.push('/search')} style={styles.entry}>
    <Ionicons name="search-outline" size={27} color={theme.colors.text} accessible={false} />
    {/* A stable screen-reader label avoids announcing decorative text changes. */}
    <Animated.View accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.window, { height: lineHeight }]}>
      <Animated.Text numberOfLines={1} allowFontScaling={false} style={[styles.prompt, { lineHeight, fontSize: 16 * fontScale, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, lineHeight] }) }] }]}>{PROMPTS[index]}</Animated.Text>
      {!reducedMotion && <Animated.Text numberOfLines={1} allowFontScaling={false} style={[styles.prompt, { lineHeight, fontSize: 16 * fontScale, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-lineHeight, 0] }) }] }]}>{PROMPTS[(index + 1) % PROMPTS.length]}</Animated.Text>}
    </Animated.View>
  </Pressable>;
}
const styles = StyleSheet.create({
  entry: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 56, backgroundColor: theme.colors.search, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border },
  window: { flex: 1, minWidth: 0, overflow: 'hidden' },
  prompt: { position: 'absolute', left: 0, right: 0, fontFamily: theme.fonts.regular, fontSize: 16, color: theme.colors.textSecondary },
});
