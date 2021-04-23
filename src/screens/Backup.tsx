import React, {useContext, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dialog from 'storage/Dialog';
import BackupUtils from 'utils/backup';
import db from 'storage/DB';

/**
 * Backup screen
 * @category Screens
 */
export const Backup = ({navigation}: {navigation: any}) => {
  const dialogContext = useContext(Dialog.Context);

  const backupFile = async () => {
    const seed = await db.getSeed();
    await BackupUtils.checkPermissions(
      () =>
        navigation.navigate('WalletFileBackup', {
          seed: seed?.split(' '),
          type: BackupUtils.BackupType.File,
          isNewAccount: false,
        }),
      () =>
        dialogContext.dispatch(
          Dialog.open(
            'Open settings',
            'If you want to save a file then open the application settings and give it access to the storage.',
            () => dialogContext.dispatch(Dialog.close()),
          ),
        ),
    );
  };
  const backupGoogleDrive = async () => {
    const seed = await db.getSeed();
    await BackupUtils.backupGoogleDrive(() =>
      navigation.navigate('WalletFileBackup', {
        seed: seed?.split(' '),
        type: BackupUtils.BackupType.GoogleDrive,
        isNewAccount: false,
      }),
    );
  };
  const backupSeed = async () => {
    const seed = await db.getSeed();
    navigation.navigate('SaveSeed', {
      seed: seed?.split(' '),
      isNewAccount: false,
    });
  };

  const menuItems = [
    {
      img: (
        <Image
          source={require('assets/img/google-drive.png')}
          style={{width: 32, height: 32}}
        />
      ),
      title: 'On Google Drive',
      onClick: () => backupGoogleDrive(),
    },
    {
      img: <MaterialIcons name="folder-open" size={32} color="#888888" />,
      title: 'To encrypted file',
      onClick: () => backupFile(),
    },
    {
      img: (
        <MaterialCommunityIcons name="content-copy" size={32} color="#888888" />
      ),
      title: 'Back up manually',
      onClick: () => backupSeed(),
    },
  ];
  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onClick}>
      {item.img}
      <Text style={styles.menuTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.box}>
      <Text style={styles.description}>
        Save your wallet in a safe place. If you lose your wallet, you cannot
        restore access to it.
      </Text>
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
  box: {
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
  description: {
    width: '90%',
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  menu: {
    flex: 1,
    width: '88%',
    marginTop: 20,
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
});
