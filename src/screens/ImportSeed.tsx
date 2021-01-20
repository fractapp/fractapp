import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput} from 'react-native';
import {BlueButton, Loader} from 'components/index';
import {mnemonicValidate} from '@polkadot/util-crypto';
import GlobalStore from 'storage/Global';
import db from 'storage/DB';

export const ImportSeed = () => {
  const globalContext = useContext(GlobalStore.Context);
  const [seed, setSeed] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isSaveSeed, setSaveSeed] = useState<boolean>(false);

  const startSaveSeed = async () => {
    setLoading(true);
    setSaveSeed(true);
  };

  useEffect(() => {
    if (!isSaveSeed) {
      return;
    }
    db.createAccounts(seed).then(async () => {
      globalContext.dispatch(GlobalStore.signInLocal());
      setLoading(false);
    });
  }, [isSaveSeed]);

  const renderButtonOrError = () => {
    if (seed.split(' ').length < 12) {
      return null;
    }

    if (!mnemonicValidate(seed)) {
      return <Text style={styles.invalidSeed}>Invalid secret phrase</Text>;
    }

    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton text={'Next'} height={50} onPress={startSaveSeed} />
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
      <Text style={styles.title}>Import secret phrase</Text>
      <Text style={styles.description}>
        Import your secret phrase. (12 or 14 words)
      </Text>
      <TextInput
        autoCorrect={false}
        multiline={true}
        style={styles.seedInput}
        onChangeText={(value) => setSeed(value)}
      />

      {renderButtonOrError()}
    </View>
  );
};

const styles = StyleSheet.create({
  seedInput: {
    width: '90%',
    height: 150,
    padding: 20,
    textAlignVertical: 'top',
    marginTop: 30,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#888888',
    color: 'black',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
  invalidSeed: {
    marginTop: 15,
    color: 'red',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
  title: {
    marginTop: 80,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    width: '90%',
    textAlign: 'center',
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
});
