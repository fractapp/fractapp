import React, {useContext} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components/index';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import Dialog from 'storage/Dialog';
import Backup from 'utils/backup';

export const SaveWallet = ({navigation}: {navigation: any}) => {
  const seed = mnemonicGenerate().split(' ');
  const dialogContext = useContext(Dialog.Context);

  const backupFile = async () => {
    await Backup.backupFile(
      () =>
        navigation.navigate('WalletFileBackup', {
          seed: seed,
          type: Backup.BackupType.File,
          isNewAccount: true,
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
    await Backup.backupGoogleDrive(() =>
      navigation.navigate('WalletFileBackup', {
        seed: seed,
        type: Backup.BackupType.GoogleDrive,
        isNewAccount: true,
      }),
    );
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>Save a wallet</Text>
      <Text style={styles.description}>
        Save your wallet in a safe place. If you lose your wallet, you cannot
        restore access to it.
      </Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 30}}>
        <WhiteButton
          text={'Backup seed'}
          height={50}
          img={Img.Copy}
          width="90%"
          onPress={() =>
            navigation.navigate('SaveSeed', {
              seed: seed,
              isNewAccount: true,
            })
          }
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'Encrypted file'}
            img={Img.File}
            height={50}
            onPress={backupFile}
          />
        </View>
        {
          <View style={{marginTop: 20, width: '90%'}}>
            <WhiteButton
              text={'Google drive'}
              img={Img.GoogleDrive}
              height={50}
              onPress={backupGoogleDrive}
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
  description: {
    width: '90%',
    marginTop: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
