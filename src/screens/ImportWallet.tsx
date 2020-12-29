import React, {useContext} from 'react';
import {StyleSheet, View, Text, Alert, PermissionsAndroid} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {WhiteButton, Img} from 'components';
import backupUtil from 'utils/backup';
import {FileBackup} from 'models/backup';
import googleUtil from 'utils/google';
import Dialog from 'storage/Dialog';

export const ImportWallet = ({navigation}: {navigation: any}) => {
  const dialogContext = useContext(Dialog.Context);

  const openFilePicker = async () => {
    const statues = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    let isGaranted = true;
    for (let key in statues) {
      const status = statues[key];
      if (status == 'granted') {
        continue;
      }
      if (status == 'never_ask_again') {
        dialogContext.dispatch(
          Dialog.open(
            'Open settings',
            'If you want to import a file then open the application settings and give it access to the storage.',
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
      }

      isGaranted = false;
    }

    if (!isGaranted) {
      return;
    }

    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    let file: FileBackup;
    try {
      file = await backupUtil.getFile(res.uri);
    } catch (err) {
      Alert.alert('Error', 'Invalid file');
      return;
    }

    navigation.navigate('WalletFileImport', {file: file});
  };

  const openFileGoogleDrivePicker = async () => {
    await googleUtil.signOut();
    await googleUtil.signIn();
    navigation.navigate('GoogleDrivePicker');
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        marginTop: 40,
      }}>
      <Text style={styles.title}>Import a wallet</Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <WhiteButton
          text={'Enter seed'}
          height={50}
          img={Img.Key}
          width="90%"
          onPress={() => navigation.navigate('ImportSeed')}
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'From file'}
            img={Img.File}
            height={50}
            onPress={() => openFilePicker()}
          />
        </View>
        {
          <View style={{marginTop: 20, width: '90%'}}>
            <WhiteButton
              text={'Google drive'}
              img={Img.GoogleDrive}
              height={50}
              onPress={() => openFileGoogleDrivePicker()}
            />
          </View>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 80,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
});
