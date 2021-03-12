import React, {useContext, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Keychain from 'react-native-keychain';
import GlobalStore from 'storage/Global';
import backend from 'utils/backend';
import {CommonActions} from '@react-navigation/native';

/**
 * Settings screen
 * @category Screens
 */
export const Settings = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);
  const isSuccessUnlock = route.params?.isSuccessUnlock ?? false;
  const action = route.params?.action ?? '';

  useEffect(() => {
    if (!isSuccessUnlock) {
      return;
    }
    navigation.navigate(action);
    navigation.dispatch({
      ...CommonActions.setParams({isSuccessUnlock: false}),
      source: route.key,
    });
  }, [isSuccessUnlock]);

  const menuItems = [
    {
      img: require('assets/img/edit-profile.png'),
      title: 'Edit profile',
      onClick: () =>
        globalContext.state.isRegistered
          ? navigation.navigate('EditProfile')
          : navigation.navigate('Connecting'),
    },
    {
      img: require('assets/img/backup.png'),
      title: 'Backup',
      onClick: async () => {
        if (globalContext.state.authInfo.isPasscode) {
          navigation.navigate('VerifyPassCode', {
            isVerify: true,
            returnScreen: route.name,
            action: 'Backup',
            screenKey: route.key,
          });
        } else {
          navigation.navigate('Backup');
        }
      },
    },
    {
      img: require('assets/img/safety.png'),
      title: globalContext.state.authInfo.isPasscode
        ? 'Disable passcode'
        : 'Enable passcode',
      onClick: async () => {
        if (globalContext.state.authInfo.isPasscode) {
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
      title: globalContext.state.authInfo.isBiometry
        ? 'Disable biometry'
        : 'Enable biometry',
      onClick: async () => {
        navigation.navigate('VerifyPassCode', {
          isChangeBiometry: true,
        });
      },
      isDisable:
        (Keychain.getSupportedBiometryType() != null &&
          !globalContext.state.authInfo.isPasscode) ||
        Keychain.getSupportedBiometryType() == null,
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
      <TouchableOpacity
        style={styles.account}
        testID={'avatarBtn'}
        onPress={() => {
          globalContext.state.isRegistered
            ? navigation.navigate('EditProfile')
            : navigation.navigate('Connecting');
        }}>
        <View style={styles.avatar}>
          <Image
            source={
              globalContext.state.profile.avatarExt === ''
                ? require('assets/img/default-avatar.png')
                : {
                    uri: backend.getImgUrl(
                      globalContext.state.profile.id,
                      globalContext.state.profile.avatarExt,
                      globalContext.state.profile.lastUpdate,
                    ),
                  }
            }
            style={styles.avatar}
            width={70}
            height={70}
          />
        </View>
        <View style={styles.name}>
          {globalContext.state.profile.username !== '' ? (
            <Text style={[styles.nameText, {color: 'black'}]}>
              {globalContext.state.profile.name}
            </Text>
          ) : (
            <Text style={[styles.nameText, {color: '#888888'}]}>Name</Text>
          )}

          {globalContext.state.profile.username !== '' ? (
            <Text style={[styles.nickText, {color: 'black'}]}>
              @{globalContext.state.profile.username}
            </Text>
          ) : (
            <Text style={[styles.nickText, {color: '#888888'}]}>Username</Text>
          )}
        </View>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 35,
    width: 70,
    height: 70,
  },
  name: {
    paddingLeft: '4%',
    flexDirection: 'column',
  },
  nameText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
  },
  nickText: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
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
