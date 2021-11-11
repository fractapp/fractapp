/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Root from './Root';
import {name as appName} from './app.json';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import backend from 'utils/fractappClient';
import DB from 'storage/DB';

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: async function (info) {
    let dbToken = await DB.getFirebaseToken();
    if (dbToken == null || dbToken !== info.token) {
      const ok = await backend.setToken(info.token);
      if (ok) {
        await DB.setFirebaseToken(info.token);
        console.log('Token initialized');
      }
    }
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: false,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});
//PushNotification.deleteChannel('chats');
PushNotification.createChannel(
  {
    channelId: 'chats', // (required)
    channelName: 'Chats', // (required)
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true,
    playSound: true,
  },
  (created) => console.log(`createChannel 'chats' returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
);

AppRegistry.registerComponent(appName, () => Root);
