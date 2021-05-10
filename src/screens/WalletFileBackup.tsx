import React, {useState, useContext, useEffect} from 'react';
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

const minPasswordLength = 8;
const schema = new passwordValidator();
schema.is().min(minPasswordLength).has().lowercase(1).has().digits(1);

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
  const dialogContext = useContext(Dialog.Context);
  const globalContext = useContext(GlobalStore.Context);

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
      setLoading(false);

      if (res.isError) {
        return;
      }

      if (res.isExist) {
        dialogContext.dispatch(
          Dialog.open(
            StringUtils.texts.FileExistTitle,
            StringUtils.texts.FileExistText,
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }

      let isSuccessSave = false;
      for (let wallet of files.wallets) {
        if (wallet.replace('.json', '') === fileName.trim()) {
          isSuccessSave = true;
          break;
        }
      }

      if (!isSuccessSave) {
        dialogContext.dispatch(
          Dialog.open(StringUtils.texts.ServiceUnavailableTitle, '', () =>
            dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }

      if (!globalContext.state.authInfo.isAuthed) {
        await DB.createAccounts(seed);
        globalContext.dispatch(GlobalStore.signInLocal());
      }

      /*
      TODO: file
       if (type === backupUtils.BackupType.File) {
        dialogContext.dispatch(
          Dialog.open(
            StringUtils.texts.SuccessSaveWalletTitle,
            StringUtils.texts.SuccessSaveWalletText(
              fileName.trim(),
              backupUtils.FSDriveFolder,
            ),
            () => {
              dialogContext.dispatch(Dialog.close());
            },
          ),
        );
      }*/

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
