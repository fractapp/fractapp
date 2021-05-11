import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {navigationRef} from 'utils/RootNavigation';
import {
  Start,
  SettingWallet,
  ImportWallet,
  SaveWallet,
  ConfirmSaveSeed,
  WalletFileBackup,
  SaveSeed,
  WalletDetails,
  ImportSeed,
  WalletFileImport,
  NewPassCode,
  Receive,
  TransactionDetails,
  Backup,
  VerifyPassCode,
  EditProfile,
  EditPhoneNumber,
  SelectCountry,
  ConfirmCode,
  Chat,
  Connecting,
  EditEmail,
  EditUsername,
  EditName,
  Search,
  SelectWallet,
  Send,
  EnterAmount,
  Legal,
  ChooseImportWallet,
} from 'screens/index';
import {TabMenu} from 'components/TabMenu';
import {getSymbol} from 'types/wallet';
import StringUtils from 'utils/string';
import {Language} from 'screens/Language';

/**
 * Main navigation stack
 * @category Screens
 */
const RootStack = createStackNavigator();

/**
 * Navigation screen
 * @category Screens
 */
export const Navigation = ({isInitialized}: {isInitialized: boolean}) => {
  const Theme = {
    dark: false,
    colors: {
      primary: '#2AB2E2',
      background: 'white',
      card: 'white',
      text: '#888888',
      border: 'white',
      notification: '#2AB2E2',
    },
  };
  const getEmptyRouter = (name: string, component: any) => {
    return (
      <RootStack.Screen
        options={{headerShown: false}}
        name={name}
        component={component}
      />
    );
  };
  const getRouterWithTitle = (
    name: string,
    title: string,
    component: any,
    postfix?: (route: any) => string,
  ) => {
    return (
      <RootStack.Screen
        name={name}
        component={component}
        options={({route}) => ({
          title: title + (postfix ? postfix(route) : ''),
          headerTitleAlign: 'center',
          headerTintColor: '#2AB2E2',
          headerRightContainerStyle: {
            marginRight: 10,
          },
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          cardShadowEnabled: true,
          headerTitleStyle: {
            fontSize: 18,
            textAlign: 'center',
            fontFamily: 'Roboto-Bold',
            color: 'black',
          },
        })}
      />
    );
  };

  const getCreateWalletScreens = () => {
    return (
      <>
        {getEmptyRouter('Home', Start)}
        {getEmptyRouter('SettingWallet', SettingWallet)}
        {getEmptyRouter('ImportWallet', ImportWallet)}
        {getEmptyRouter('SaveWallet', SaveWallet)}
        {getEmptyRouter('ImportSeed', ImportSeed)}
        {getEmptyRouter('WalletFileImport', WalletFileImport)}
        {getEmptyRouter('Legal', Legal)}
        {getEmptyRouter('ChooseImportWallet', ChooseImportWallet)}
      </>
    );
  };
  const getWalletExistScreens = () => {
    return (
      <>
        {getEmptyRouter('Home', TabMenu)}
        {getEmptyRouter('NewPassCode', NewPassCode)}
        {getEmptyRouter('VerifyPassCode', VerifyPassCode)}
        {getRouterWithTitle(
          'WalletDetails',
          StringUtils.texts.titles.details,
          WalletDetails,
        )}
        {getRouterWithTitle(
          'TransactionDetails',
          StringUtils.texts.titles.transaction,
          TransactionDetails,
        )}
        {getRouterWithTitle('Backup', StringUtils.texts.titles.backup, Backup)}
        {getRouterWithTitle(
          'EditProfile',
          StringUtils.texts.titles.editProfile,
          EditProfile,
        )}
        {getRouterWithTitle(
          'ConfirmCode',
          StringUtils.texts.titles.confirmCode,
          ConfirmCode,
        )}
        {getRouterWithTitle(
          'SelectCountry',
          StringUtils.texts.titles.selectCountry,
          SelectCountry,
        )}
        {getRouterWithTitle(
          'EditPhoneNumber',
          StringUtils.texts.titles.phoneNumber,
          EditPhoneNumber,
        )}
        {getRouterWithTitle(
          'EditEmail',
          StringUtils.texts.titles.email,
          EditEmail,
        )}
        {getRouterWithTitle(
          'EditUsername',
          StringUtils.texts.titles.editUsername,
          EditUsername,
        )}
        {getRouterWithTitle(
          'EditName',
          StringUtils.texts.titles.editName,
          EditName,
        )}
        {getRouterWithTitle(
          'SelectWallet',
          StringUtils.texts.titles.selectWallet,
          SelectWallet,
        )}
        {getRouterWithTitle('Send', StringUtils.texts.titles.send, Send)}
        {getRouterWithTitle(
          'EnterAmount',
          StringUtils.texts.titles.enterAmount,
          EnterAmount,
        )}
        {getRouterWithTitle(
          'Receive',
          StringUtils.texts.titles.receive + ' ',
          Receive,
          (route) => getSymbol(route.params.currency),
        )}
        {getRouterWithTitle(
          'Language',
          StringUtils.texts.titles.language,
          Language,
        )}
        {getRouterWithTitle('Connecting', '', Connecting)}
        {getRouterWithTitle('Chat', '', Chat)}
        {getEmptyRouter('Search', Search)}
      </>
    );
  };
  const commonScreens = () => {
    return (
      <>
        {getEmptyRouter('ConfirmSaveSeed', ConfirmSaveSeed)}
        {getEmptyRouter('SaveSeed', SaveSeed)}
        {getEmptyRouter('WalletFileBackup', WalletFileBackup)}
      </>
    );
  };

  return (
    <NavigationContainer theme={Theme} ref={navigationRef}>
      <RootStack.Navigator
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}>
        {isInitialized ? getWalletExistScreens() : getCreateWalletScreens()}

        {commonScreens()}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
