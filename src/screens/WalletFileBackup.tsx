import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, NativeModules} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import {TextInput} from 'components/TextInput';
import {PasswordInput} from 'components/PasswordInput';
import {Loader} from 'components/Loader';
import DB from 'storage/DB';
import backupUtils from 'utils/backup';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import StringUtils from 'utils/string';
import passwordValidator from 'password-validator';
import googleUtil from 'utils/google';
import { useDispatch, useSelector } from 'react-redux';

const minPasswordLength = 8;
const schema = new passwordValidator();
schema.is().min(minPasswordLength).has().letters(1).has().digits(1);

/**
 * Wallet file backup screen
 * @category Screens
 */
export const WalletFileBackup = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const [fileName, setFilename] = useState<string>(
    backupUtils.randomFilename(),
  );
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const seed: string = route.params.seed.join(' ');
  const type: backupUtils.BackupType = route.params.type;

  const startBackup = async () => {
    setLoading(true);
  };

  useEffect(() => {
    NativeModules.PreventScreenshotModule.forbid().then((result: string) =>
      console.log(result),
    );

    return () =>
      NativeModules.PreventScreenshotModule.allow().then((result: string) =>
        console.log(result),
      );
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    (async () => {
      const res = await backupUtils.backup(
        seed,
        password,
        fileName.trim(),
        type,
      );

      const files = await backupUtils.getWalletsFromGoogle();

      if (res.isError) {
        setLoading(false);
        return;
      }

      if (res.isExist) {
        dispatch(
          Dialog.actions.showDialog({
            title: StringUtils.texts.FileExistTitle,
            text: StringUtils.texts.FileExistText,
            onPress: () => dispatch(Dialog.actions.hideDialog()),
          })
        );
        setLoading(false);
        return;
      }

      let isSuccessSave = false;
      for (let i = 0; i < files.wallets.length; i++) {
        const wallet = files.wallets[i];
        if (wallet.replace('.json', '') === fileName.trim()) {
          const file = await googleUtil.getFileBackup(files.ids[i]);
          try {
            const fileSeed = await backupUtils.getSeed(file, password);
            if (fileSeed === seed) {
              isSuccessSave = true;
            }
          } catch (e) {}
          break;
        }
      }

      setLoading(false);

      if (!isSuccessSave) {
        dispatch(
          Dialog.actions.showDialog({
            title: StringUtils.texts.ServiceUnavailableTitle,
            text: '',
            onPress: () => dispatch(Dialog.actions.hideDialog()),
          })
        );
        return;
      }

      if (!globalState.authInfo.hasWallet) {
        await DB.createAccounts(seed);
        dispatch(GlobalStore.actions.initWallet());
      }

      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    })();
  }, [isLoading]);

  const renderButtonOrError = () => {
    if (password.length < minPasswordLength && password !== '') {
      return (
        <Text style={styles.error}>
          {StringUtils.texts.walletFileBackup.passLenErr}
        </Text>
      );
    } else if (!schema.validate(password) && password !== '') {
      return (
        <Text style={styles.error}>
          {StringUtils.texts.walletFileBackup.symbolOrNumberErr}
        </Text>
      );
    } else if (password !== confirmPassword && confirmPassword !== '') {
      return (
        <Text style={styles.error}>
          {StringUtils.texts.walletFileBackup.passNotMatchErr}
        </Text>
      );
    }

    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton
          text={StringUtils.texts.ConfirmBtnTitle}
          height={50}
          onPress={startBackup}
        />
      </View>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>
        {StringUtils.texts.walletFileBackup.title}
      </Text>
      <Text style={styles.description}>
        {StringUtils.texts.walletFileBackup.description}
      </Text>

      <View style={styles.fileName}>
        <TextInput
          onChangeText={(value: string) => setFilename(value)}
          placeholder={StringUtils.texts.walletFileBackup.filenamePlaceholder}
          defaultValue={fileName}
        />
      </View>
      <View style={styles.newPassword}>
        <PasswordInput
          onChangeText={(value: string) => setPassword(value)}
          placeholder={StringUtils.texts.walletFileBackup.passwordPlaceholder}
          defaultValue={password}
        />
      </View>
      <View style={styles.confirmPassword}>
        <PasswordInput
          onChangeText={(value: string) => setConfirmPassword(value)}
          placeholder={StringUtils.texts.walletFileBackup.confirmPassword}
          defaultValue={confirmPassword}
        />
      </View>
      {renderButtonOrError()}
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
  fileName: {
    marginTop: 30,
    width: '90%',
  },
  newPassword: {
    marginTop: 20,
    width: '90%',
  },
  confirmPassword: {
    marginTop: 20,
    width: '90%',
  },
  error: {
    marginTop: 20,
    color: 'red',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
});
