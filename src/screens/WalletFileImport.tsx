import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View, Text, Alert} from 'react-native';
import {BlueButton, PasswordInput, Loader} from 'components/index';
import db from 'storage/DB';
import backupUtil from 'utils/backup';
import {FileBackup} from 'models/backup';
import GlobalStore from 'storage/Global';

export const WalletFileImport = ({route}: {route: any}) => {
  const globalContext = useContext(GlobalStore.Context);

  const [password, setPassword] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const file: FileBackup = route.params.file;

  const startImport = async () => {
    setLoading(true);
  };

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    (async () => {
      let seed = '';
      try {
        seed = await backupUtil.getSeed(file, password);
      } catch (e) {
        console.log(e);
        Alert.alert('Invalid password');
        setLoading(false);
        return;
      }

      await db.createAccounts(seed);
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
      <Text style={styles.title}>Wallet decryption</Text>
      <Text style={styles.description}>
        Enter the password to decrypt your wallet.
      </Text>

      <View style={styles.newPassword}>
        <PasswordInput
          onChangeText={(value: string) => setPassword(value)}
          placeholder={'Password'}
        />
      </View>

      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton text={'Decrypt'} height={50} onPress={startImport} />
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
