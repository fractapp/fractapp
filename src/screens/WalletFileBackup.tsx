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

const minPasswordLength = 6;

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
      setLoading(false);

      if (res.isError) {
        return;
      }

      if (res.isExist) {
        dialogContext.dispatch(
          Dialog.open('File exists', 'Please enter a different file name', () =>
            dialogContext.dispatch(Dialog.close()),
          ),
        );
        return;
      }

      if (!globalContext.state.authInfo.isAuthed) {
        console.log('create account');
        await DB.createAccounts(seed);
        globalContext.dispatch(GlobalStore.signInLocal());
      }

      if (type === backupUtils.BackupType.File) {
        dialogContext.dispatch(
          Dialog.open(
            'Success save wallet',
            `If you lose access to file then you will not be able to restore access to the wallet. File "${fileName.trim()}.json" saved in "${
              backupUtils.FSDriveFolder
            }" directory`,
            async () => {
              dialogContext.dispatch(Dialog.close());
            },
          ),
        );
      }
      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
    })();
  }, [isLoading]);

  const renderButtonOrError = () => {
    if (confirmPassword === '' || password === '') {
      return null;
    } else if (
      password.length < minPasswordLength &&
      password !== '' &&
      confirmPassword !== ''
    ) {
      return (
        <Text style={styles.error}>
          Minimum password length is 6 characters
        </Text>
      );
    } else if (password !== confirmPassword) {
      return <Text style={styles.error}>Password do not match</Text>;
    }

    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton text={'Confirm'} height={50} onPress={startBackup} />
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
      <Text style={styles.title}>Wallet encryption</Text>
      <Text style={styles.description}>
        Enter the password to encrypt your wallet. Do not lose your password
        otherwise you will not be able to restore access.
      </Text>

      <View style={styles.fileName}>
        <TextInput
          onChangeText={(value: string) => setFilename(value)}
          placeholder={'File name'}
          defaultValue={fileName}
        />
      </View>
      <View style={styles.newPassword}>
        <PasswordInput
          onChangeText={(value: string) => setPassword(value)}
          placeholder={'Password'}
          defaultValue={password}
        />
      </View>
      <View style={styles.confirmPassword}>
        <PasswordInput
          onChangeText={(value: string) => setConfirmPassword(value)}
          placeholder={'Confirm password'}
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
