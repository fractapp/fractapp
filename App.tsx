import "./shim.js";
import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { Wallets, Start, SettingWallet, ImportWallet, SaveWallet, ConfirmSaveSeed, WalletEncryption, SaveSeed, WalletDetails } from 'screens'
import { getSeed, removeSeed } from 'utils/db'

export default function App() {
  const [isSeedExist, setIsSeedExist] = useState<Boolean>(false)

  const Stack = createStackNavigator();

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
      getSeed().then((seed) => setIsSeedExist(seed != undefined))
  });

  let root = TabScreen
  if (!isSeedExist) {
    root = Start
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={styles.container.backgroundColor} barStyle={"dark-content"} hidden={false} />

      <NavigationContainer theme={Theme} >
        <Stack.Navigator screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
        }}
        >

          <Stack.Screen options={{ headerShown: false }} name="Root" component={root} />
          <Stack.Screen options={{ headerShown: false }} name="TabScreen" component={TabScreen} />
          <Stack.Screen options={{ headerShown: false }} name="SettingWallet" component={SettingWallet} />
          <Stack.Screen options={{ headerShown: false }} name="ImportWallet" component={ImportWallet} />
          <Stack.Screen options={{ headerShown: false }} name="SaveWallet" component={SaveWallet} />
          <Stack.Screen options={{ headerShown: false }} name="WalletEncryption" component={WalletEncryption} />
          <Stack.Screen options={{ headerShown: false }} name="SaveSeed" component={SaveSeed} />
          <Stack.Screen options={{ headerShown: false }} name="ConfirmSaveSeed" component={ConfirmSaveSeed} />

          <Stack.Screen
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


        </Stack.Navigator>
      </NavigationContainer>


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

  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();

  const WalletTab = () => {
    return (<Stack.Navigator>
      <Stack.Screen
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
    </Stack.Navigator>)
  }

  return (
    <Tab.Navigator
      tabBarOptions={{ style: { elevation: 0 }, labelStyle: { fontFamily: "Roboto-Regular" } }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case MenuTabs.Discovery:
              return <MaterialIcons name="explore" size={size} color={color} />
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

      <Tab.Screen name={MenuTabs.Wallet} component={WalletTab} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
});
