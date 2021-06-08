import React, {useEffect} from 'react';
import {StyleSheet, View, Text, NativeModules, Image} from 'react-native';
import {SeedButton} from 'components/SeedButton';
import {BlueButton} from 'components/BlueButton';
import {showMessage} from 'react-native-flash-message';
import Clipboard from '@react-native-community/clipboard';
import StringUtils from 'utils/string';

/**
 * Save seed screen
 * @category Screens
 */
export const SaveSeed = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const seed = route.params.seed;

  let seedBtns = [];
  for (let index in seed) {
    seedBtns.push(
      <SeedButton
        key={seed[index]}
        prefix={String(Number(index) + 1)}
        text={seed[index]}
      />,
    );
  }

  useEffect(() => {
    NativeModules.PreventScreenshotModule.forbid().then((result: string) =>
      console.log(result),
    );

    return () =>
      NativeModules.PreventScreenshotModule.allow().then((result: string) =>
        console.log(result),
      );
  }, []);

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>{StringUtils.texts.saveSeed.title}</Text>
      <Text style={styles.description}>
        {StringUtils.texts.saveSeed.description}
      </Text>
      <View style={styles.seed}>{seedBtns}</View>

      <Text
        style={styles.copy}
        onPress={() => {
          Clipboard.setString(seed.join(' '));
          showMessage({
            message: StringUtils.texts.showMsg.copiedToClipboard,
            type: 'info',
            icon: 'info',
          });
        }}>
        Copy
      </Text>

      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton
          text={StringUtils.texts.NextBtnTitle}
          height={50}
          onPress={() =>
            navigation.navigate('ConfirmSaveSeed', {
              seed: seed,
              isNewAccount: route.params.isNewAccount,
            })
          }
        />
      </View>

      <View style={styles.infoBox}>
        <Image
          source={require('assets/img/info.png')}
          style={{
            width: 35,
            height: 35,
          }}
        />
        <Text style={styles.infoMsg}>{StringUtils.texts.saveSeed.info}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seed: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    marginTop: 40,
  },
  infoBox: {
    position: 'absolute',
    bottom: 120,
    padding: 20,
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FCFF',
    borderRadius: 10,
  },
  infoMsg: {
    marginTop: 20,
    width: '90%',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  copy: {
    alignSelf: 'flex-end',
    marginRight: '10%',
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#2AB2E2',
  },
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
  newPassword: {
    marginTop: 30,
    width: '90%',
  },
  confirmPassword: {
    marginTop: 20,
    width: '90%',
  },
});
