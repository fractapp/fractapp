## Only android version

## Getting Started

1. Setup ANDROID SDK and React Native (without expo and use java version from instruction)
   
    https://reactnative.dev/docs/environment-setup
    
2. Install the [emulator](https://developer.android.com/studio/run/managing-avds) or (connect a device)[https://reactnative.dev/docs/running-on-device]
    
3. Create debug.keystore
```sh
keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

4. Get SHA1 key for next step (it will be needed for setup google drive and firebase)
```
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

5. Setup Google Drive api (If you want to use save/import seed with Google Drive) 
   
   5.1. [Enable Api](https://developers.google.com/drive/api/v3/enable-drive-api)
   
   5.2. [Setting up OAuth 2.0](https://support.google.com/cloud/answer/6158849?authuser=1#installedapplications&android&zippy=%2Cnative-applications)
   
   5.3. Open OAuth consent screen -> Edit App -> Save and continue -> Add or remove scopes -> add '.../auth/drive' scope 


6. Setup firebase. The instruction is [below](https://github.com/fractapp/fractapp#setup-firebase)

   If you want to receive notifications without install fractapp-server and setup firebase then use apk file from [release](https://github.com/fractapp/fractapp/releases). Otherwise, you need to run [fractapp-server](https://github.com/fractapp/fractapp-server). 


7. Configure .env (example in .env-temp)
```sh
FRACTAPP_API - fractapp server url
POLKADOT_SUBSCAN_API - polkadot subscan url
KUSAMA_SUBSCAN_API - kusama subscan url
POLKADOT_WSS_API - polkadot node websocket url
KUSAMA_WSS_API - kusama node websocket url
```

8. Install yarn packages
```sh
yarn install
```

9. Start on android device or emulator
```sh
yarn android
```

## Setup firebase 

1. Add project
2. Enter a name
3. Add app (Android)
4. Set "com.fractapp" in the "Android package name" input
5. Get SHA1 and set this in the "Debug signing certificate SHA-1" input
```
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
6. Copy google-services.json to android/app/google-services.json
7. Skip other steps
8. Finish

## Tests

Start tests with coverage info
```sh
yarn test --coverage
```

Start tests with update snapshot
```sh
yarn test --coverage --u
```
