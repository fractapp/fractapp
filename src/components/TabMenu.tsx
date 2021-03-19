import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Wallets} from 'screens/Wallets';
import {Settings} from 'screens/Settings';
import {Chats} from 'screens/Chats';
import GlobalStore from 'storage/Global';

/**
 * All Tab Navigator
 * @category Components
 */
const Tab = createBottomTabNavigator();

/**
 * Wallet Tab Stack
 * @category Components
 */
const WalletStack = createStackNavigator();

/**
 * Chats Tab Stack
 * @category Components
 */
const ChatsStack = createStackNavigator();

/**
 * Profile Tab Stack
 * @category Components
 */
const ProfileStack = createStackNavigator();

/**
 * Menu with tabs
 * @category Components
 */
export const TabMenu = () => {
  const globalContext = useContext(GlobalStore.Context);

  const MenuTabs = {
    Discovery: 'Discovery',
    Chats: 'Chats',
    Wallet: 'Wallet',
    Profile: 'Profile',
  };
  return (
    <Tab.Navigator
      tabBarOptions={{
        style: {elevation: 0, marginBottom: 5},
        labelStyle: {fontFamily: 'Roboto-Regular'},
      }}
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          switch (route.name) {
            case MenuTabs.Chats:
              return <FontAwesome name="comments" size={size} color={color} />;
            case MenuTabs.Wallet:
              return <Ionicons name="md-card" size={size} color={color} />;
            case MenuTabs.Profile:
              return <Ionicons name="person" size={size} color={color} />;
          }
        },
      })}>
      <Tab.Screen name={MenuTabs.Wallet} component={WalletTab} />
      <Tab.Screen
        name={MenuTabs.Chats}
        component={ChatsTab}
        options={{
          tabBarBadge:
            globalContext.state.notificationCount === 0
              ? undefined
              : globalContext.state.notificationCount,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: 'white',
            fontFamily: 'Roboto-Medium',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: 12,
          },
        }}
      />
      <Tab.Screen name={MenuTabs.Profile} component={ProfileTab} />
    </Tab.Navigator>
  );
};

/**
 * Wallet Tab
 * @category Components
 */
const WalletTab = () => {
  return (
    <WalletStack.Navigator>
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
            textAlign: 'center',
            fontFamily: 'Roboto-Bold',
            color: 'black',
          },
        }}
      />
    </WalletStack.Navigator>
  );
};

/**
 * Chats Tab
 * @category Components
 */
const ChatsTab = () => {
  return (
    <ChatsStack.Navigator>
      <WalletStack.Screen
        name="Chats"
        component={Chats}
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
            textAlign: 'center',
            fontFamily: 'Roboto-Bold',
            color: 'black',
          },
        }}
      />
    </ChatsStack.Navigator>
  );
};

/**
 * Profile Tab
 * @category Components
 */
const ProfileTab = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={Settings}
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
            textAlign: 'center',
            fontFamily: 'Roboto-Bold',
            color: 'black',
          },
        }}
      />
    </ProfileStack.Navigator>
  );
};
