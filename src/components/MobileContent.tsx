import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Shared horizontal layout for phones of different sizes.
 * Percentage width shrinks with the screen; maxWidth prevents stretched content
 * on unusually wide phones. Backgrounds can still extend edge to edge outside it.
 * No device-model checks or screenshot pixel widths are needed.
 */
export function MobileContent({ children }: PropsWithChildren) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
});
