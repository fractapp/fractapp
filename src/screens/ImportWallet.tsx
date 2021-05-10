import React, {useContext} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components/WhiteButton';
import backup from 'utils/backup';
import googleUtil from 'utils/google';
import Backup from 'utils/backup';
import Global from 'storage/Global';
import GlobalStore from 'storage/Global';
import {showMessage} from 'react-native-flash-message';
import StringUtils from 'utils/string';

/**
 * Import wallet screen
 * @category Screens
 */
export const ImportWallet = ({navigation}: {navigation: any}) => {
  const globalContext = useContext(Global.Context);

  const openFileGoogleDrivePicker = async () => {
    await googleUtil.signOut();
    await googleUtil.signIn();

    globalContext.dispatch(GlobalStore.setLoading(true));
    const files = await backup.getWalletsFromGoogle();
    const wallets = files.wallets;
    const ids = files.ids;

    if (wallets.length === 0) {
      showMessage({
        message: StringUtils.texts.showMsg.walletNotFound,
        type: 'danger',
        icon: 'danger',
      });
      globalContext.dispatch(GlobalStore.setLoading(false));
    } else if (wallets.length === 1) {
      navigation.navigate('WalletFileImport', {
        file: await googleUtil.getFileBackup(ids[0]),
      });
    } else {
      navigation.navigate('ChooseImportWallet', {
        wallets: wallets,
        ids: ids,
        type: Backup.BackupType.GoogleDrive,
      });
    }
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>{StringUtils.texts.titles.restoreWallet}</Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 70}}>
        <View style={{width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.importWallet.googleDriveTitle}
            img={Img.GoogleDrive}
            height={50}
            onPress={() => openFileGoogleDrivePicker()}
          />
        </View>
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={StringUtils.texts.importWallet.manuallyTitle}
            height={50}
            img={Img.Key}
            onPress={() => navigation.navigate('ImportSeed')}
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
});
