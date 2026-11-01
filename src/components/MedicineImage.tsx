import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** Keep a local fallback while remote dummy imagery loads or is unavailable. */
export function MedicineImage({ url, height = 130 }: { url: string; height?: number }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  return (
    <View style={[styles.frame, { height }]} accessible={false}>
      {loadedUrl !== url && <Ionicons name="medkit-outline" size={48} color="#B5B1C8" />}
      {failedUrl !== url && <Image
        source={{ uri: url }}
        style={[styles.image, { height: height - 20 }]}
        resizeMode="contain"
        fadeDuration={0}
        onLoad={() => setLoadedUrl(url)}
        onError={() => setFailedUrl(url)}
        accessible={false}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  image: { position: 'absolute', width: '80%' },
});
