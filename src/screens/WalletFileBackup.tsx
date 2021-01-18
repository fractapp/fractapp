import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {BlueButton, TextInput, PasswordInput, Loader} from 'components';
import db from 'storage/DB';
import backupUtil from 'utils/backup';
import Dialog from 'storage/Dialog';
import BackupUtils from 'utils/backup';
import GlobalStore from 'storage/Global';

const minPasswordLength = 6;

export const WalletFileBackup = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dialogContext = useContext(Dialog.Context);
  const authContext = useContext(GlobalStore.Context);

  const [fileName, setFilename] = useState<string>(backupUtil.randomFilename());
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const seed: string = route.params.seed.join(' ');
  const type: backupUtil.BackupType = route.params.type;
  const isNewAccount: backupUtil.BackupType = route.params.isNewAccount;

  const startBackup = async () => {
    setLoading(true);
  };

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    backupUtil.backup(seed, password, fileName, type).then(async () => {
      setLoading(false);

      await db.createAccounts(seed);
      const dir =
        route.params.type == BackupUtils.BackupType.File
          ? 'Downloads'
          : backupUtil.GoogleDriveFolder;

      dialogContext.dispatch(
        Dialog.open(
          'Success save wallet',
          `If you lose access to file then you will not be able to restore access to the wallet. File "${fileName}.json" saved in "${dir}" directory`,
          async () => {
            await dialogContext.dispatch(Dialog.close());

            if (isNewAccount) {
              await authContext.dispatch(GlobalStore.signInLocal());
            }

            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          },
        ),
      );
    });
  }, [isLoading]);

  const renderButtonOrError = () => {
    if (confirmPassword == '' || password == '') {
      return null;
    } else if (
      password.length < minPasswordLength &&
      password != '' &&
      confirmPassword != ''
    ) {
      return (
        <Text style={styles.error}>
          Minimum password length is 6 characters
        </Text>
      );
    } else if (password != confirmPassword) {
      return <Text style={styles.error}>Password do not match</Text>;
    }

    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton text={'Encrypt'} height={50} onPress={startBackup} />
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
