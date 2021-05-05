import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
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
        {getRouterWithTitle('WalletDetails', 'Details', WalletDetails)}
        {getRouterWithTitle(
          'TransactionDetails',
          'Transaction',
          TransactionDetails,
        )}
        {getRouterWithTitle('Backup', 'Backup', Backup)}
        {getRouterWithTitle('EditProfile', 'Edit Profile', EditProfile)}
        {getRouterWithTitle('ConfirmCode', 'Confirm code', ConfirmCode)}
        {getRouterWithTitle('SelectCountry', 'Select country', SelectCountry)}
        {getRouterWithTitle('EditPhoneNumber', 'Phone number', EditPhoneNumber)}
        {getRouterWithTitle('EditEmail', 'Email', EditEmail)}
        {getRouterWithTitle('EditUsername', 'Edit Username', EditUsername)}
        {getRouterWithTitle('EditName', 'Edit Name', EditName)}
        {getRouterWithTitle('SelectWallet', 'Select Wallet', SelectWallet)}
        {getRouterWithTitle('Send', 'Send', Send)}
        {getRouterWithTitle('EnterAmount', 'Enter Amount', EnterAmount)}
        {getEmptyRouter('Search', Search)}
        {getRouterWithTitle('Chat', '', Chat)}
        {getRouterWithTitle('Receive', 'Receive ', Receive, (route) =>
          getSymbol(route.params.currency),
        )}
        {getRouterWithTitle('Connecting', '', Connecting)}
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
    <NavigationContainer theme={Theme}>
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
