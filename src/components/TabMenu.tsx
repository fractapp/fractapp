import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Wallets, Settings, Chats} from 'screens';
import AuthStore from 'storage/Auth';

const Tab = createBottomTabNavigator();
const WalletStack = createStackNavigator();
const ChatStack = createStackNavigator();
const ProfileStack = createStackNavigator();

export const TabMenu = () => {
  const authContext = useContext(AuthStore.Context);

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
      <Tab.Screen name={MenuTabs.Wallet} component={Wallet} />
      <Tab.Screen
        name={MenuTabs.Chats}
        component={ChatsTab}
        options={{
          tabBarBadge: authContext.notificationCount,
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
      <Tab.Screen name={MenuTabs.Profile} component={Profile} />
    </Tab.Navigator>
  );
};

const Wallet = () => {
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
const ChatsTab = () => {
  return (
    <ChatStack.Navigator>
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
    </ChatStack.Navigator>
  );
};
const Profile = () => {
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
