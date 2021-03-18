## Only android version

## Getting Started

1. Setup ANDROID SDK and React Native (not expo)
   
    https://reactnative.dev/docs/environment-setup

2. Get SHA1 key for next step
```
   keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

3. Setup Google Drive api (If you want to use save/import seed with Google Drive) 
   
   5.1. [Enable Api](https://developers.google.com/drive/api/v3/enable-drive-api)
   
   5.2. [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849?authuser=1#installedapplications&android&zippy=%2Cnative-applications)
   
   5.3. Open OAuth consent screen -> Edit App -> Save and continue -> Add or remove scopes -> add '.../auth/drive' scope 


4. Setup firebase (If you want to receive notifications) [here](https://firebase.google.com/docs/android/setup)
```
Path for google-services.json:
android/app/google-services.json
```

5. Create debug.keystore
```sh
keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

6. Configure .env (example in .env-temp)
```sh
FRACTAPP_API - fractapp server url
POLKADOT_SUBSCAN_API - polkadot subscan url
KUSAMA_SUBSCAN_API - kusama subscan url
POLKADOT_WSS_API - polkadot node websocket url
KUSAMA_WSS_API - kusama node websocket url
```

7. Install yarn packages
```sh
yarn install
```

8. Start on android device or emulator
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
