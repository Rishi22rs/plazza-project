import AsyncStorage from '@react-native-async-storage/async-storage';

// Only prompt history is stored, never the actual OS grant or coordinates.
const KEY = 'plazza:notification-prompt:v1';

export async function hasPromptedNotifications(): Promise<boolean> {
  try {
    return await AsyncStorage.getItem(KEY) === 'attempted';
  } catch {
    // If storage is unavailable, prefer an explicit retry over surprise prompts.
    return true;
  }
}

export async function markNotificationsPrompted(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'attempted');
  } catch {
    // Storage failure must not prevent a user-initiated native request.
  }
}
