import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View, Text, NativeModules} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import {PasswordInput} from 'components/PasswordInput';
import {Loader} from 'components/Loader';
import DB from 'storage/DB';
import backupUtil from 'utils/backup';
import {FileBackup} from 'types/backup';
import GlobalStore from 'storage/Global';
import Dialog from 'storage/Dialog';
import StringUtils from 'utils/string';

/**
 * Wallet file import screen
 * @category Screens
 */
export const WalletFileImport = ({route}: {route: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const dialogContext = useContext(Dialog.Context);

  const [password, setPassword] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const file: FileBackup = route.params.file;

  const startImport = async () => {
    setLoading(true);
  };

  useEffect(() => {
    globalContext.dispatch(GlobalStore.setLoading(false));

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
      let seed = '';
      try {
        seed = await backupUtil.getSeed(file, password);
      } catch (e) {
        dialogContext.dispatch(
          Dialog.open(
            StringUtils.texts.walletFileImport.invalidPasswordTitle,
            '',
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
        setLoading(false);
        return;
      }

      await DB.createAccounts(seed);
      globalContext.dispatch(GlobalStore.signInLocal());
    })();
  }, [isLoading]);

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
        {StringUtils.texts.walletFileImport.title}
      </Text>
      <Text style={styles.description}>
        {StringUtils.texts.walletFileImport.description}
      </Text>

      <View style={styles.newPassword}>
        <PasswordInput
          onChangeText={(value: string) => setPassword(value)}
          placeholder={StringUtils.texts.walletFileImport.passwordPlaceholder}
        />
      </View>

      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton
          text={StringUtils.texts.RestoreBtn}
          height={50}
          onPress={startImport}
        />
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
    textAlign: 'center',
    width: '90%',
    marginTop: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  newPassword: {
    marginTop: 30,
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
