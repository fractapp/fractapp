import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DB from 'utils/db';
import Keychain from 'react-native-keychain';

export const Settings = ({navigation}: {navigation: any}) => {
  const [isPasscode, setExistPasscode] = useState<Boolean>(false);
  const [isBiometry, setBiometry] = useState<Boolean>(false);

  const MenuItems = [
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
      title: isPasscode ? 'Disable passcode' : 'Enable passcode',
      onClick: async () => {
        if (isPasscode) {
          navigation.navigate('VerifyPassCode', {
            onSuccess: async () => {
              await DB.disablePasscode();
              await update();
            },
            isGoBack: true,
          });
        } else {
          navigation.navigate('NewPassCode', {
            onSuccess: async () => {
              await update();
            },
          });
        }
      },
    },
    {
      img: require('assets/img/biometry-btn.png'),
      title: isBiometry ? 'Disable biometry' : 'Enable biometry',
      onClick: async () => {
        navigation.navigate('VerifyPassCode', {
          onSuccess: async (passcode: string) => {
            await DB.disablePasscode();
            await DB.enablePasscode(passcode, !isBiometry);
            await update();
          },
          isGoBack: true,
        });
      },
      isDisable: !isPasscode && Keychain.getSupportedBiometryType() != null,
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
      title: 'Help',
      onClick: '',
    },
    {
      img: require('assets/img/about.png'),
      title: 'About us',
      onClick: '',
    },
  ];

  const update = async () => {
    setExistPasscode(await DB.isPasscode());
    setBiometry(await DB.isBiometry());
  };

  useEffect(() => {
    update();
  }, []);

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
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
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
            data={MenuItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.title}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
  },
  nickText: {
    fontSize: 17,
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
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
    alignSelf: 'center',
  },
  disableMenuTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: '#888888',
    alignSelf: 'center',
  },
});
