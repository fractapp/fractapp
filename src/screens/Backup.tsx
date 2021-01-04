import React, {useContext, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dialog from 'storage/Dialog';
import BackupUtils from 'utils/backup';
import db from 'utils/db';
import backupUtil from 'utils/backup';

export const Backup = ({navigation, route}: {navigation: any; route: any}) => {
  const dialogContext = useContext(Dialog.Context);

  const onSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
    dialogContext.dispatch(Dialog.close());
  };

  useEffect(() => {
    if (route.params?.isSuccess == null) {
      return;
    }

    const dir =
      route.params.type == BackupUtils.BackupType.File
        ? 'Downloads'
        : backupUtil.GoogleDriveFolder;

    dialogContext.dispatch(
      Dialog.open(
        'Success save wallet',
        `If you lose access to file then you will not be able to restore access to the wallet. File "${route.params?.fileName}.json" saved in "${dir}" directory`,
        onSuccess,
      ),
    );
  }, [route.params?.isSuccess]);

  const backupFile = async () => {
    const seed = await db.getSeed();
    await BackupUtils.backupFile(
      () =>
        navigation.navigate('WalletFileBackup', {
          seed: seed?.split(' '),
          type: BackupUtils.BackupType.File,
          callerScreen: 'Backup',
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
        callerScreen: 'Backup',
      }),
    );
  };
  const backupSeed = async () => {
    const seed = await db.getSeed();
    navigation.navigate('SaveSeed', {
      seed: seed?.split(' '),
      onSuccess: () =>
        navigation.reset({
          index: 0,
          routes: [{name: 'Home'}],
        }),
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
      title: 'Google disk',
      onClick: () => backupGoogleDrive(),
    },
    {
      img: <MaterialIcons name="folder-open" size={32} color="#888888" />,
      title: 'File to phone',
      onClick: () => backupFile(),
    },
    {
      img: (
        <MaterialCommunityIcons name="content-copy" size={32} color="#888888" />
      ),
      title: 'Backup seed',
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
    <View style={styles.profile}>
      <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.description}>
            Save your wallet in a safe place. If you lose your wallet, you
            cannot restore access to it.
          </Text>
          <FlatList
            style={styles.menu}
            ItemSeparatorComponent={() => <View style={styles.dividingLine} />}
            data={menuItems}
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
