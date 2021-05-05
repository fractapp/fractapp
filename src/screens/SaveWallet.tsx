import React, {useContext} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components/WhiteButton';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import Dialog from 'storage/Dialog';
import Backup from 'utils/backup';
import StringUtils from 'utils/string';

/**
 * Save wallet screen
 * @category Screens
 */
export const SaveWallet = ({navigation}: {navigation: any}) => {
  const seed = mnemonicGenerate().split(' ');

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
      <Text style={styles.title}>{StringUtils.texts.saveWallet.title}</Text>
      <Text style={styles.description}>
        {StringUtils.texts.saveWallet.description}
      </Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 30}}>
        <View style={{width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.saveWallet.googleDriveTitle}
            img={Img.GoogleDrive}
            height={50}
            onPress={backupGoogleDrive}
          />
        </View>
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.saveWallet.manuallyTitle}
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
