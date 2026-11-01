#!/usr/bin/env bash
# Produce a standalone demo APK and a Metro-connected debug APK.
# Expo generates android/; native files are deliberately not edited or committed.
set -euo pipefail
cd "$(dirname "$0")/.."

# Prefer an explicitly selected Java runtime, otherwise the installed Android
# Studio runtime (the shell's old Java 13 cannot run modern Android Gradle).
if [[ -n "${PLAZZA_JAVA_HOME:-}" ]]; then
  export JAVA_HOME="$PLAZZA_JAVA_HOME"
elif [[ -d '/Applications/Android Studio.app/Contents/jbr/Contents/Home' ]]; then
  export JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home'
fi
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export EXPO_NO_TELEMETRY=1
npx expo prebuild --platform android --no-install
(
  cd android
  ./gradlew :app:assembleRelease :app:assembleDebug \
    "-PreactNativeArchitectures=${PLAZZA_ABIS:-arm64-v8a,x86_64}" \
    -Pandroid.enableMinifyInReleaseBuilds=false --max-workers=2
)
mkdir -p output/apk
cp android/app/build/outputs/apk/release/app-release.apk output/apk/plazza-preview.apk
cp android/app/build/outputs/apk/debug/app-debug.apk output/apk/plazza-debug.apk
printf '%s\n' 'APKs created in output/apk (preview is self-contained; debug uses Metro).'
