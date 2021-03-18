## Only android version

## Getting Started

1. Setup ANDROID SDK and React Native (not expo)
   
    https://reactnative.dev/docs/environment-setup
   

2. Setup firebase (If you want to receive notifications)
   https://firebase.google.com/docs/android/setup
```
Path for google-services.json:
android/app/google-services.json
```

3. Create debug.keystore
```sh
keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey1 -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

4. Configure .env (example in .env-temp)
```sh
FRACTAPP_API - fractapp server url
POLKADOT_SUBSCAN_API - polkadot subscan url
KUSAMA_SUBSCAN_API - kusama subscan url
POLKADOT_WSS_API - polkadot node websocket url
KUSAMA_WSS_API - kusama node websocket url
```

5. Install yarn packages
```sh
yarn install
```

6. Start on android device or emulator
```sh
yarn android
```

## Tests

Start tests with coverage info
```sh
yarn test --coverage
```

Start tests with update snapshot
```sh
yarn test --coverage --u
```
