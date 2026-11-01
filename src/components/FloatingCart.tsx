import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MedicineImage } from './MedicineImage';
import { theme } from '../theme/theme';

type Props = { count: number; imageUrl?: string };

/** Floating action owns its motion. Cart/business state stays in the provider. */
export function FloatingCart({ count, imageUrl }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [progress] = useState(() => new Animated.Value(0));
  const [emphasis] = useState(() => new Animated.Value(1));
  const previousCount = useRef(0);
  const visible = count > 0;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReducedMotion(value);
    }).catch(() => { if (active) setReducedMotion(false); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;
    // Animate transforms rather than width: Android can run the motion on its
    // UI thread. Only the background scales, so text/images do not squash.
    if (reducedMotion) { progress.setValue(visible ? 1 : 0); return; }
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 380 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    // Stopping an interrupted exit allows a quick new Add to reverse smoothly.
    return () => animation.stop();
  }, [visible, reducedMotion, progress]);

  useEffect(() => {
    const addedAnother = previousCount.current > 0 && count > previousCount.current;
    previousCount.current = count;
    if (!addedAnother || reducedMotion !== false) return;
    const animation = Animated.sequence([
      Animated.timing(emphasis, { toValue: 1.035, duration: 100, useNativeDriver: true }),
      Animated.timing(emphasis, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]);
    animation.start();
    return () => { animation.stop(); emphasis.setValue(1); };
  }, [count, reducedMotion, emphasis]);

  return <Animated.View
    pointerEvents={visible ? 'auto' : 'none'}
    aria-hidden={!visible}
    accessibilityElementsHidden={!visible}
    importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    style={[styles.container, {
      width: Math.min(width - 40, fontScale > 1.3 ? 320 : 252),
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [110, 0] }) }],
      opacity: progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
    }]}
  >
    <Animated.View pointerEvents="none" style={[styles.background, {
      transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }, { scale: emphasis }],
    }]} />
    <Animated.View style={{ opacity: progress.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0, 1] }) }}>
      <Pressable disabled={!visible} accessibilityRole="button" accessibilityLabel={`View cart, ${count} ${count === 1 ? 'item' : 'items'}`} onPress={() => router.navigate('/cart')} style={styles.action}>
        <View style={styles.thumbnail} accessible={false}>{imageUrl ? <MedicineImage url={imageUrl} height={42} /> : <Ionicons name="bag-outline" size={24} color={theme.colors.primary} />}</View>
        <View style={styles.copy}><Text style={styles.count}>{count} {count === 1 ? 'item' : 'items'}</Text><Text style={styles.label}>View cart</Text></View>
        <View style={styles.arrow}><Ionicons name="chevron-forward" size={29} color="white" /></View>
      </Pressable>
    </Animated.View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  // Shadow is outside the pill's rounded surface; clipping here would erase it.
  // elevation supplies Android depth, while shadow* supports iOS/web previews.
  container: { position: 'absolute', bottom: 20, alignSelf: 'center', zIndex: 20 },
  background: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.primary, borderRadius: 50, borderWidth: 1, borderColor: '#FF55BB', shadowColor: '#241032', shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.28, shadowRadius: 15, elevation: 14 },
  action: { minHeight: 70, padding: 8, paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumbnail: { width: 42, height: 42, backgroundColor: 'white', borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  count: { fontFamily: theme.fonts.bold, color: 'white', fontSize: 16 },
  label: { fontFamily: theme.fonts.bold, color: 'white', fontSize: 13 },
  arrow: { minWidth: 48, minHeight: 48, borderRadius: 28, backgroundColor: '#D0007C', alignItems: 'center', justifyContent: 'center' },
});
