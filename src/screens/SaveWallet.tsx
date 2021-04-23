import React, {useContext} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components/WhiteButton';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import Dialog from 'storage/Dialog';
import Backup from 'utils/backup';

/**
 * Save wallet screen
 * @category Screens
 */
export const SaveWallet = ({navigation}: {navigation: any}) => {
  const seed = mnemonicGenerate().split(' ');
  const dialogContext = useContext(Dialog.Context);

  const backupFile = async () => {
    await Backup.checkPermissions(
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
        Save your wallet keys in a safe place. If you lose your wallet keys, you
        cannot restore access to it. Do not share this with anyone.
      </Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 30}}>
        <View style={{width: '90%'}}>
          <WhiteButton
            text={'On Google Drive'}
            img={Img.GoogleDrive}
            height={50}
            onPress={backupGoogleDrive}
          />
        </View>
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'To encrypted file'}
            img={Img.File}
            height={50}
            onPress={backupFile}
          />
        </View>
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'Back up manually'}
            height={50}
            img={Img.Copy}
            onPress={() =>
              navigation.navigate('SaveSeed', {
                seed: seed,
                isNewAccount: true,
              })
            }
          />
        </View>
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
