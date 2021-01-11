import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Keychain from 'react-native-keychain';
import GlobalStore from 'storage/Global';

export const Settings = ({navigation}: {navigation: any}) => {
  const globalContext = useContext(GlobalStore.Context);

  const menuItems = [
    {
      img: require('assets/img/edit-profile.png'),
      title: 'Edit profile',
      onClick: () => navigation.navigate('EditProfile'),
    },
    {
      img: require('assets/img/backup.png'),
      title: 'Backup',
      onClick: () => navigation.navigate('Backup'),
    },
    {
      img: require('assets/img/safety.png'),
      title: globalContext.state.isPasscode
        ? 'Disable passcode'
        : 'Enable passcode',
      onClick: async () => {
        if (globalContext.state.isPasscode) {
          navigation.navigate('VerifyPassCode', {
            isDisablePasscode: true,
          });
        } else {
          navigation.navigate('NewPassCode');
        }
      },
    },
    {
      img: require('assets/img/biometry-btn.png'),
      title: globalContext.state.isBiometry
        ? 'Disable biometry'
        : 'Enable biometry',
      onClick: async () => {
        navigation.navigate('VerifyPassCode', {
          isChangeBiometry: true,
        });
      },
      isDisable:
        !globalContext.state.isPasscode &&
        Keychain.getSupportedBiometryType() != null,
    },
    {
      img: require('assets/img/twitter.png'),
      title: 'Twitter',
      onClick: () => Linking.openURL('https://twitter.com/wfractapp'),
    },
    {
      img: require('assets/img/telegram.png'),
      title: 'Telegram',
      onClick: () => Linking.openURL('https://t.me/fractapp'),
    },
    {
      img: require('assets/img/faq.png'),
      title: 'FAQ',
      onClick: () =>
        Linking.openURL(
          'https://medium.com/fractapp/fractapp-faq-4e76810c0564',
        ),
    },
    {
      img: require('assets/img/help.png'),
      title: 'Help',
      onClick: () => Linking.openURL('mailto:support@fractapp.com'),
    },
    {
      img: require('assets/img/about.png'),
      title: 'About us',
      onClick: () => Linking.openURL('https://fractapp.com'),
    },
  ];
  const renderItem = ({item}: {item: any}) => {
    if (item.isDisable) {
      return (
        <View style={styles.menuItem}>
          <Image source={item.img} style={{width: 32, height: 32}} />
          <Text style={styles.disableMenuTitle}>{item.title}</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity style={styles.menuItem} onPress={item.onClick}>
        <Image source={item.img} style={{width: 32, height: 32}} />
        <Text style={styles.menuTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.profile}>
      <View style={styles.account}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={40}
            color="#2AB2E2"
          />
        </View>
        <View style={styles.name}>
          <Text style={styles.nameText}>Elshan</Text>
          <Text style={styles.nickText}>@cryptobadboy</Text>
        </View>
      </View>
      <FlatList
        style={styles.menu}
        ItemSeparatorComponent={() => <View style={styles.dividingLine} />}
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dividingLine: {
    alignSelf: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
  account: {
    width: '100%',
    paddingLeft: '6%',
    flexDirection: 'row',
  },
  avatar: {
    width: 70,
    height: 70,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    paddingTop: 10,
    paddingLeft: '4%',
    flexDirection: 'column',
  },
  nameText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
  },
  nickText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
  },
  menu: {
    flex: 1,
    width: '88%',
    marginTop: 25,
  },
  menuItem: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
    alignSelf: 'center',
  },
  disableMenuTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: '#888888',
    alignSelf: 'center',
  },
});
