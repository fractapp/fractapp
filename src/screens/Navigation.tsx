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
  GoogleDrivePicker,
  NewPassCode,
  Receive,
  TransactionDetails,
  Backup,
  VerifyPassCode,
  EditProfile,
  EditPhoneNumber,
  SelectCountry,
  ConfirmCode,
} from 'screens';
import {TabMenu} from 'components';
import {getSymbol} from 'models/wallet';

const RootStack = createStackNavigator();

export const Navigation = (isWalletCreated: {isWalletCreated: boolean}) => {
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
        {getEmptyRouter('Root', Start)}
        {getEmptyRouter('SettingWallet', SettingWallet)}
        {getEmptyRouter('ImportWallet', ImportWallet)}
        {getEmptyRouter('SaveWallet', SaveWallet)}
        {getEmptyRouter('ImportSeed', ImportSeed)}
        {getEmptyRouter('WalletFileImport', WalletFileImport)}
        {getEmptyRouter('GoogleDrivePicker', GoogleDrivePicker)}
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
        {getRouterWithTitle(
          'EditPhoneNumber',
          'Edit phone number',
          EditPhoneNumber,
        )}
        {getRouterWithTitle('Receive', 'Receive ', Receive, (route) =>
          getSymbol(route.params.currency),
        )}
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
        {!isWalletCreated ? getCreateWalletScreens() : getWalletExistScreens()}

        {commonScreens()}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
