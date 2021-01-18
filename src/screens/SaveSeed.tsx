import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {BlueButton, SeedButton} from 'components';
import {showMessage} from 'react-native-flash-message';
import Clipboard from '@react-native-community/clipboard';

export const SaveSeed = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const seed = route.params.seed;

  let seedBtns = new Array<Element>();
  for (let index in seed) {
    seedBtns.push(
      <SeedButton
        key={seed[index]}
        prefix={Number(index) + 1}
        text={seed[index]}
      />,
    );
  }

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>Your secret phrase</Text>
      <Text style={styles.description}>
        Write or copy these words in the correct order and keep in a safe place.
      </Text>
      <View style={styles.seed}>{seedBtns}</View>

      <Text
        style={styles.copy}
        onPress={() => {
          Clipboard.setString(seed.join(' '));
          showMessage({
            message:
              "Seed is copied. Don't forget to remove it from your clipboard!",
            type: 'info',
            icon: 'info',
          });
        }}>
        Copy
      </Text>
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton
          text={'Next'}
          height={50}
          onPress={() =>
            navigation.navigate('ConfirmSaveSeed', {
              seed: seed,
              isNewAccount: route.params.isNewAccount,
            })
          }
        />
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
