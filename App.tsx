import "./shim.js";
import React, { useState, useEffect, useReducer } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from "react-native-flash-message";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import {
  Wallets, Start, SettingWallet, ImportWallet, SaveWallet,
  ConfirmSaveSeed, WalletFileBackup, SaveSeed, WalletDetails,
  ImportSeed, WalletFileImport, GoogleDrivePicker, NewPassCode,
  Receive, Milestone, TransactionDetails, SplashScreen, Profile,
  Backup, VerifyPassCode, EditProfile
} from 'screens'
import { Dialog, PassCode } from 'components'
import tasks from 'utils/tasks'
import AuthStore from 'storage/Auth'
import DialogStore from 'storage/Dialog'
import AccountsStore from 'storage/Accounts'
import PricesStore from 'storage/Prices'
import { getSymbol } from "models/wallet";
import changeNavigationBarColor, { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';
import PasscodeUtil from 'utils/passcode';
import { showMessage } from "react-native-flash-message";
import DB from 'utils/db'

const Tab = createBottomTabNavigator();
const WalletStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const RootStack = createStackNavigator();

export default function App() {
  const [authStore, authDispatch] = useReducer(AuthStore.reducer, AuthStore.initialState);
  const [dialogStore, diaglogDispatch] = useReducer(DialogStore.reducer, DialogStore.initialState);
  const [accountsStore, accountsDispatch] = useReducer(AccountsStore.reducer, AccountsStore.initialState);
  const [pricesStore, pricesDispatch] = useReducer(PricesStore.reducer, PricesStore.initialState);

  const [isLoading, setLoading] = useState<Boolean>(false)
  const [isLocked, setLocked] = useState<Boolean>(false)
  const [isBiometry, setBiometry] = useState<Boolean>(false)

  const Theme = {
    dark: false,
    colors: {
      primary: '#2AB2E2',
      background: styles.container.backgroundColor,
      card: styles.container.backgroundColor,
      text: '#888888',
      border: 'white',
      notification: '#2AB2E2'
    }
  };

  const onSubmitPasscode = async (passcode: Array<number>) => {
    let hash = await DB.getPasscodeHash()
    if (hash == PasscodeUtil.hash(passcode.join(""), await DB.getSalt())) {
      setLocked(false)
    } else {
      showMessage({
        message: "Incorrect passcode",
        type: "danger",
        icon: "warning"
      })
    }
  }

  useEffect(() => {
    hideNavigationBar()
    setLoading(true);

    DB.isSigned().then(async (isSigned) => {
      if (isSigned) {
        setLocked(await DB.isPasscode())
        setBiometry(await DB.isBiometry())
        authDispatch(AuthStore.signIn());
        await tasks.createTask(accountsDispatch, pricesDispatch)
      }

      showNavigationBar()
      await changeNavigationBarColor('#ffffff', true, true);
      setLoading(false);
    })
  }, [authStore.isSign]);

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={styles.container.backgroundColor} barStyle={"dark-content"} hidden={false} />
      <DialogStore.Context.Provider value={{ dialog: dialogStore.dialog, dispatch: diaglogDispatch }}>
        <AuthStore.Context.Provider value={{ isSign: authStore.isSign, dispatch: authDispatch }}>
          <AccountsStore.Context.Provider value={{ accounts: accountsStore.accounts, dispatch: accountsDispatch }}>
            <PricesStore.Context.Provider value={{ prices: pricesStore.prices, dispatch: pricesDispatch }}>
              {
                !isLocked ?
                  <NavigationContainer theme={Theme} >
                    <RootStack.Navigator screenOptions={{
                      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                    >

                      {!authStore.isSign ?
                        <>
                          <RootStack.Screen options={{ headerShown: false }} name="Root" component={Start} />
                          <RootStack.Screen options={{ headerShown: false }} name="SettingWallet" component={SettingWallet} />
                          <RootStack.Screen options={{ headerShown: false }} name="ImportWallet" component={ImportWallet} />
                          <RootStack.Screen options={{ headerShown: false }} name="SaveWallet" component={SaveWallet} />
                          <RootStack.Screen options={{ headerShown: false }} name="ImportSeed" component={ImportSeed} />
                          <RootStack.Screen options={{ headerShown: false }} name="WalletFileImport" component={WalletFileImport} />
                          <RootStack.Screen options={{ headerShown: false }} name="GoogleDrivePicker" component={GoogleDrivePicker} />
                        </>
                        :
                        <>
                          <RootStack.Screen options={{ headerShown: false }} name="Home" component={TabScreen} />
                          <RootStack.Screen
                            name="WalletDetails"
                            component={WalletDetails}
                            options={{
                              title: "Details",
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
                                textAlign: "center",
                                fontFamily: "Roboto-Bold",
                                color: "black"
                              },
                            }}
                          />
                          <RootStack.Screen
                            name="TransactionDetails"
                            component={TransactionDetails}
                            options={{
                              title: "Transaction",
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
                                textAlign: "center",
                                fontFamily: "Roboto-Bold",
                                color: "black"
                              },
                            }}
                          />
                          <RootStack.Screen
                            name="Receive"
                            component={Receive}
                            options={({ route }) => ({
                              title: "Receive " + getSymbol(route.params.currency),
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
                                textAlign: "center",
                                fontFamily: "Roboto-Bold",
                                color: "black"
                              },
                            })}
                          />
                          <RootStack.Screen
                            name="Backup"
                            component={Backup}
                            options={{
                              title: "Backup",
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
                                textAlign: "center",
                                fontFamily: "Roboto-Bold",
                                color: "black"
                              },
                            }}
                          />
                          <RootStack.Screen
                            name="EditProfile"
                            component={EditProfile}
                            options={{
                              title: "Edit Profile",
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
                                textAlign: "center",
                                fontFamily: "Roboto-Bold",
                                color: "black"
                              },
                            }}
                          />
                          <RootStack.Screen
                            name="NewPassCode"
                            component={NewPassCode}
                            options={{
                              headerShown: false
                            }}
                          />
                          <RootStack.Screen
                            name="VerifyPassCode"
                            component={VerifyPassCode}
                            options={{
                              headerShown: false
                            }}
                          />

                        </>
                      }

                      <RootStack.Screen options={{ headerShown: false }} name="ConfirmSaveSeed" component={ConfirmSaveSeed} />
                      <RootStack.Screen options={{ headerShown: false }} name="SaveSeed" component={SaveSeed} />
                      <RootStack.Screen options={{ headerShown: false }} name="WalletFileBackup" component={WalletFileBackup} />
                    </RootStack.Navigator>

                  </NavigationContainer>
                  : <PassCode isBiometry={isBiometry} isBiometryStart={isBiometry} description={"Enter passcode"} onSubmit={onSubmitPasscode} />
              }
            </PricesStore.Context.Provider>
          </AccountsStore.Context.Provider>
        </AuthStore.Context.Provider>

        <Dialog
          visible={dialogStore.dialog.visible}
          onPress={dialogStore.dialog.onPress}
          title={dialogStore.dialog.title}
          text={dialogStore.dialog.text}
        />
      </DialogStore.Context.Provider>
      <FlashMessage position="bottom" />
    </SafeAreaProvider>
  );
}

const TabScreen = () => {
  const MenuTabs = {
    Discovery: "Discovery",
    Chats: "Chats",
    Wallet: "Wallet",
    Profile: "Profile"
  }
  return (
    <Tab.Navigator
      tabBarOptions={{ style: { elevation: 0, marginBottom: 5 }, labelStyle: { fontFamily: "Roboto-Regular" } }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case MenuTabs.Chats:
              return <FontAwesome name="comments" size={size} color={color} />
              break;
            case MenuTabs.Wallet:
              return <Ionicons name="md-card" size={size} color={color} />
            case MenuTabs.Profile:
              return <MaterialIcons name="perm-identity" size={size} color={color} />
          }
        },
      })}>

      <Tab.Screen name={MenuTabs.Wallet} component={Wallet} />
      <Tab.Screen name={MenuTabs.Chats} component={Chats} />
      <Tab.Screen name={MenuTabs.Profile} component={ProfileTab} />
    </Tab.Navigator>
  )
}

const Wallet = () => {
  return (<WalletStack.Navigator>
    <WalletStack.Screen
      name="Wallet"
      component={Wallets}
      options={{
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
          textAlign: "center",
          fontFamily: "Roboto-Bold",
          color: "black"
        },
      }}
    />
  </WalletStack.Navigator>)
}

const Chats = () => {
  return (<ChatStack.Navigator>
    <ChatStack.Screen
      name="Milestone 3"
      component={Milestone}
      options={{
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
          textAlign: "center",
          fontFamily: "Roboto-Bold",
          color: "black"
        },
      }}
    />
  </ChatStack.Navigator>)
}

const ProfileTab = () => {
  return (<ProfileStack.Navigator>
    <ProfileStack.Screen
      name="Profile"
      component={Profile}
      options={{
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
          textAlign: "center",
          fontFamily: "Roboto-Bold",
          color: "black"
        },
      }}
    />
  </ProfileStack.Navigator>)
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
});
