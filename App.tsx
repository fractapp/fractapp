import "./shim.js";
import React, { useState, useEffect, useReducer } from 'react';
import { StyleSheet, StatusBar, View, Text, Alert } from 'react-native';
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
  ImportSeed, WalletFileImport, GoogleDiskPicker,
  Receive, Milestone, TransactionDetails
} from 'screens'
import { Dialog, SplashScreen } from 'components'
import * as db from 'utils/db'
import * as tasks from 'utils/tasks'
import * as AuthStore from 'storage/Auth'
import * as DialogStore from 'storage/Dialog'
import * as AccountsStore from 'storage/Accounts'
import * as PricesStore from 'storage/Prices'
import { Currency, getSymbol } from "models/wallet";
import changeNavigationBarColor, { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';

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

  useEffect(() => {
    hideNavigationBar()
    setLoading(true);

    db.getSeed().then(async (seed) => {
      if (seed != undefined) {
        authDispatch(AuthStore.signIn());
      }
      if (authStore.isSign) {
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
      <DialogStore.Context.Provider value={{ dialogStore, diaglogDispatch }}>
        <AuthStore.Context.Provider value={{ authStore, authDispatch }}>
          <AccountsStore.Context.Provider value={{ accountsStore, accountsDispatch }}>
            <PricesStore.Context.Provider value={{ pricesStore, pricesDispatch }}>
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
                      <RootStack.Screen options={{ headerShown: false }} name="WalletFileBackup" component={WalletFileBackup} />
                      <RootStack.Screen options={{ headerShown: false }} name="SaveSeed" component={SaveSeed} />
                      <RootStack.Screen options={{ headerShown: false }} name="ConfirmSaveSeed" component={ConfirmSaveSeed} />
                      <RootStack.Screen options={{ headerShown: false }} name="ImportSeed" component={ImportSeed} />
                      <RootStack.Screen options={{ headerShown: false }} name="WalletFileImport" component={WalletFileImport} />
                      <RootStack.Screen options={{ headerShown: false }} name="GoogleDiskPicker" component={GoogleDiskPicker} />
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
                    </>
                  }
                </RootStack.Navigator>

              </NavigationContainer>
            </PricesStore.Context.Provider>
          </AccountsStore.Context.Provider>
        </AuthStore.Context.Provider>

        <Dialog
          visible={dialogStore.visible}
          onPress={dialogStore.onPress}
          title={dialogStore.title}
          text={dialogStore.text}
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
      <Tab.Screen name={MenuTabs.Profile} component={Profile} />
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

const Profile = () => {
  return (<ProfileStack.Navigator>
    <ProfileStack.Screen
      name="Milestone 2"
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
  </ProfileStack.Navigator>)
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
});
