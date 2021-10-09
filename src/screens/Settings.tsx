import React, {useEffect} from 'react';
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
import backend from 'utils/api';
import {CommonActions} from '@react-navigation/native';
import StringUtils from 'utils/string';
import { useDispatch, useSelector } from 'react-redux';

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
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

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
      title: StringUtils.texts.settings.editProfile,
      onClick: () =>
        globalState.isRegisteredInFractapp
          ? navigation.navigate('EditProfile')
          : navigation.navigate('Connecting'),
    },
    {
      img: require('assets/img/backup.png'),
      title: StringUtils.texts.settings.backup,
      onClick: async () => {
        if (globalState.authInfo.hasPasscode) {
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
      title: globalState.authInfo.hasPasscode
        ? StringUtils.texts.settings.disablePasscode
        : StringUtils.texts.settings.enablePasscode,
      onClick: async () => {
        if (globalState.authInfo.hasPasscode) {
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
      title: globalState.authInfo.hasBiometry
        ? StringUtils.texts.settings.disableBiometry
        : StringUtils.texts.settings.enableBiometry,
      onClick: async () => {
        navigation.navigate('VerifyPassCode', {
          isChangeBiometry: true,
        });
      },
      isDisable:
        (Keychain.getSupportedBiometryType() != null &&
          !globalState.authInfo.hasPasscode) ||
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
      img: require('assets/img/help.png'),
      title: StringUtils.texts.settings.help,
      onClick: () => Linking.openURL('mailto:support@fractapp.com'),
    },
    {
      img: require('assets/img/about.png'),
      title: StringUtils.texts.settings.aboutUs,
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
          globalState.isRegisteredInFractapp
            ? navigation.navigate('EditProfile')
            : navigation.navigate('Connecting');
        }}>
        <View style={styles.avatar}>
          <Image
            source={{
              uri: backend.getImgUrl(
                globalState.profile!.id,
                globalState.profile!.lastUpdate,
              ),
            }}
            style={styles.avatar}
            width={70}
            height={70}
          />
        </View>
        <View style={styles.name}>
          {globalState.profile!.name !== '' ? (
            <Text style={[styles.nameText, {color: 'black'}]}>
              {globalState.profile!.name}
            </Text>
          ) : (
            <Text style={[styles.nameText, {color: '#888888'}]}>Name</Text>
          )}

          {globalState.profile!.username !== '' ? (
            <Text style={[styles.nickText, {color: 'black'}]}>
              @{globalState.profile!.username}
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
    borderBottomColor: '#f5f5f5',
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
