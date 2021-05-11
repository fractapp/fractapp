import ReactNative from 'react-native';
import I18n from 'react-native-i18n';

// @ts-ignore
import en from './languages/en.json';
// @ts-ignore
import ru from './languages/ru-ru.json';

ReactNative.I18nManager.allowRTL(false);
I18n.fallbacks = true;
I18n.defaultLocale = 'en';
I18n.translations = {
  en,
  ru,
};

export default I18n;
