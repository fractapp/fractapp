import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TextInput, NativeModules} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import {Loader} from 'components/Loader';
import {mnemonicValidate} from '@polkadot/util-crypto';
import GlobalStore from 'storage/Global';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';
import tasks from 'utils/tasks';

/**
 * Import seed screen
 * @category Screens
 */
export const ImportSeed = () => {
  const dispatch = useDispatch();

  const [seed, setSeed] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isSaveSeed, setSaveSeed] = useState<boolean>(false);

  const startSaveSeed = async () => {
    setLoading(true);
    setSaveSeed(true);
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
    if (!isSaveSeed) {
      return;
    }

    (async () => {
      await DB.createAccounts(seed);
      dispatch(GlobalStore.actions.initWallet());
      dispatch(GlobalStore.actions.setAllStatesLoaded(false));
      setLoading(false);
    })();
  }, [isSaveSeed]);

  const renderButtonOrError = () => {
    if (seed.split(' ').length < 12) {
      return null;
    }

    if (!mnemonicValidate(seed)) {
      return (
        <Text style={styles.invalidSeed}>
          {StringUtils.texts.importSeed.invalidSecretPhraseErr}
        </Text>
      );
    }

    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton
          text={StringUtils.texts.NextBtnTitle}
          height={50}
          onPress={startSaveSeed}
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
      <Text style={styles.title}>{StringUtils.texts.importSeed.title}</Text>
      <Text style={styles.description}>
        {StringUtils.texts.importSeed.description}
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
