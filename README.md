## Only android version

## Getting Started

1. Install yarn packages
```sh
yarn install
```


2. Create debug.keystore
```sh
keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey1 -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

3. Start on android device or emulator
```sh
yarn android
```

## Tests

```sh
yarn test --coverage
```
