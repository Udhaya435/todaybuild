# Build and Signing Guide (APK & AAB Generation)

## Prerequisites
- Node.js >= 20.x
- Java JDK 17 (recommended: OpenJDK 17 or Temurin 17)
- Android SDK Platform 34 (Android 14) and Build-Tools 34.0.0

## 1. Generating a Release Signing Keystore
Run the standard Java `keytool` command:
```bash
keytool -genkey -v -keystore nova-release-key.keystore -alias nova-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
Place `nova-release-key.keystore` inside `mobile/android/app/`.

## 2. Configure Gradle Properties
Add the following to `mobile/android/gradle.properties`:
```properties
NOVA_RELEASE_STORE_FILE=nova-release-key.keystore
NOVA_RELEASE_KEY_ALIAS=nova-key-alias
NOVA_RELEASE_STORE_PASSWORD=your_keystore_password
NOVA_RELEASE_KEY_PASSWORD=your_key_password
```

## 3. Building Signed Android APK
From the `mobile/android` directory:
```bash
# Clean and assemble release APK
./gradlew assembleRelease
```
The output APK is generated at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`

## 4. Building Signed Android App Bundle (AAB for Google Play)
```bash
./gradlew bundleRelease
```
The output AAB is generated at:
`mobile/android/app/build/outputs/bundle/release/app-release.aab`
