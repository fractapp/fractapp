import React, {useContext, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import Auth from 'storage/Auth';
import Dialog from 'storage/Dialog';
import Backup from 'utils/backup';
import db from 'utils/db';
import BackupUtils from 'utils/backup';
import backupUtil from 'utils/backup';

export const SaveWallet = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const seed = mnemonicGenerate().split(' ');
  const dialogContext = useContext(Dialog.Context);
  const authContext = useContext(Auth.Context);

  const onSuccess = () => {
    dialogContext.dispatch(Dialog.close());
    authContext.dispatch(Auth.signIn());
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
    await Backup.backupFile(
      () =>
        navigation.navigate('WalletFileBackup', {
          seed: seed,
          type: Backup.BackupType.File,
          callerScreen: 'SaveWallet',
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
        callerScreen: 'SaveWallet',
      }),
    );
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        marginTop: 40,
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
              onSuccess: async () => {
                await db.createAccounts(seed.join(' '));
                authContext.dispatch(Auth.signIn());
              },
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
