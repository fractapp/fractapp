import React, {useEffect, useState} from 'react';
import DB from 'storage/DB';
import {Text, View, Image, StyleSheet, TouchableOpacity} from 'react-native';

/**
 * Input for write passcode
 * @category Components
 */
export const PassCode = ({
  isBiometry,
  isBiometryStart = false,
  description,
  onSubmit,
}: {
  isBiometry: boolean;
  isBiometryStart?: boolean;
  description: string;
  onSubmit: (passcode: Array<number>) => void;
}) => {
  const PasscodeSize = 6;
  const [passcode, setPasscode] = useState<Array<number>>(new Array());

  const unlockWithBiometry = async () => {
    const dbPasscode = await DB.getPasscode();
    const passcodeArray = new Array<number>();
    for (let i = 0; i < dbPasscode.length; i++) {
      passcodeArray.push(Number(dbPasscode[i]));
    }

    setPasscode(passcodeArray);
  };
  const numpadClick = async (index: number) => {
    if (index === 12) {
      setPasscode(passcode.slice(0, passcode.length - 1));
    } else if (index === 10 && isBiometry) {
      unlockWithBiometry();
    } else if (passcode.length < PasscodeSize) {
      setPasscode([...passcode, index]);
    }
  };

  const renderNumpad = () => {
    const result = [];
    let line = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 3; j++) {
        const index = i * 3 + j;

        let element;
        switch (index) {
          case 10:
            element = !isBiometry ? (
              <Text style={styles.btnText} />
            ) : (
              <Image
                source={require('assets/img/fingerprint.png')}
                style={{width: 36, height: 40}}
              />
            );
            break;
          case 11:
            element = <Text style={styles.btnText}>0</Text>;
            break;
          case 12:
            element = (
              <Image
                source={require('assets/img/backspace.png')}
                style={{width: 40, height: 28}}
              />
            );
            break;
          default:
            element = <Text style={styles.btnText}>{index}</Text>;
            break;
        }

        line.push(
          <TouchableOpacity
            key={index}
            style={styles.btn}
            onPress={() => numpadClick(index)}>
            {element}
          </TouchableOpacity>,
        );
      }

      result.push(
        <View key={i} style={styles.btnsLine}>
          {line}
        </View>,
      );
      line = [];
    }
    return result;
  };

  const renderPoint = () => {
    const result = [];
    for (let i = 0; i < passcode.length; i++) {
      result.push(<View key={'p' + i} style={styles.point} />);
    }

    for (let i = 0; i < PasscodeSize - passcode.length; i++) {
      result.push(<View key={'e' + i} style={styles.emptyPoint} />);
    }

    return result;
  };

  useEffect(() => {
    if (isBiometryStart) {
      unlockWithBiometry();
    }
  }, []);

  useEffect(() => {
    if (passcode.length === PasscodeSize) {
      onSubmit(passcode);
      setPasscode(new Array());
    }
  }, [passcode]);

  return (
    <View style={styles.box}>
      <Image source={require('assets/img/logo.png')} style={styles.logo} />

      <View style={{marginTop: 20, alignContent: 'center'}}>
        <Text style={styles.description}>{description}</Text>
        <View style={{flexDirection: 'row'}}>{renderPoint()}</View>
      </View>

      <View style={styles.numpad}>{renderNumpad()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    paddingTop: 100,
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    marginTop: 80,
    marginBottom: 0,
    width: 65,
    height: 65,
  },
  title: {
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    marginBottom: 25,
    alignSelf: 'center',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  numpad: {
    position: 'absolute',
    bottom: 20,
  },
  btnsLine: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginLeft: 10,
    marginRight: 10,
  },
  btnText: {
    fontSize: 30,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  emptyPoint: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#BFBDBD',
    width: 20,
    height: 20,
    borderRadius: 20,
  },
  point: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#2AB2E2',
    width: 20,
    height: 20,
    borderRadius: 20,
  },
});
