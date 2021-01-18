import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BackendApi from 'utils/backend';
import backend from 'utils/backend';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';

export const ConfirmCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dialogContext = useContext(Dialog.Context);
  const globalContext = useContext(GlobalStore.Context);

  const [code, setCode] = useState<string>('');
  const [editable, setEditable] = useState<boolean>(true);
  const [lockTime, setLockTime] = useState<number>(60);
  const [borderColor, setBorderColor] = useState<string>('#CCCCCC');

  const value = route.params.value;
  const type = route.params.type;
  const refs = new Array(
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  );

  const tick = (time: number) => {
    time--;
    setLockTime(time);
    if (time > 0) {
      setTimeout(() => tick(time), 1000);
    }
  };

  useEffect(() => {
    setTimeout(() => tick(lockTime), 1000);
  }, []);
  useEffect(() => {
    if (code.length === 1) {
      setBorderColor('#CCCCCC');
      // styles.codeInput.borderWidth = 1;
    }
    if (code.length < BackendApi.CodeLength) {
      refs[code.length].current.focus();
    } else if (code.length === BackendApi.CodeLength) {
      Keyboard.dismiss();

      (async () => {
        setEditable(false);
        setBorderColor('#2AB2E2');

        try {
          const rsCode = await backend.auth(value, code, type);

          switch (rsCode) {
            case 400:
              dialogContext.dispatch(
                Dialog.open('Server unavailable', '', () =>
                  dialogContext.dispatch(Dialog.close()),
                ),
              );

              setCode('');
              setBorderColor('#EA4335');
              break;
            case 404:
              setCode('');
              setBorderColor('#EA4335');
              break;
            case 200:
              globalContext.dispatch(GlobalStore.signInFractapp());

              navigation.reset({
                index: 1,
                actions: [
                  navigation.navigate('Home'),
                  navigation.navigate('EditProfile'),
                ],
              });
              break;
          }
        } catch (e) {
          console.log(e);
          setCode('');
          setBorderColor('#EA4335');
        }

        setEditable(true);
      })();
    }
  }, [code]);

  const onResend = async () => {
    if (lockTime !== 0) {
      return;
    }

    setLockTime(60);
    setTimeout(() => tick(60), 1000);

    const [rsCode, err] = await BackendApi.sendCode(
      value,
      type,
      BackendApi.CheckType.Auth,
    );
    switch (rsCode) {
      case 400:
        dialogContext.dispatch(
          Dialog.open('Server unavailable', 'Please try again: ' + err, () =>
            dialogContext.dispatch(Dialog.close()),
          ),
        );
        break;
      case 404:
        dialogContext.dispatch(
          Dialog.open(
            'Invalid ' +
              (type === BackendApi.CodeType.Phone ? 'phone number' : 'email'),
            `Please validate and write ${
              type === BackendApi.CodeType.Phone ? 'phone number' : 'email'
            } again`,
            () => dialogContext.dispatch(Dialog.close()),
          ),
        );
        break;
    }
  };
  const renderTime = () => {
    const minutes = Math.floor(lockTime / 60);
    let sec = String(lockTime - minutes * 60);
    if (sec.length < 2) {
      sec = '0' + sec;
    }
    return `${minutes}:${sec}`;
  };

  const renderTextInputs = () => {
    const result = new Array();
    result.push(
      <TextInput
        key={0}
        ref={refs[0]}
        style={[styles.codeInput, {borderColor: borderColor}]}
        onFocus={() =>
          code.length !== 0 ? refs[code.length].current.focus() : {}
        }
        value={code.length !== 0 ? code[0] : ''}
        maxLength={1}
        caretHidden={true}
        onChangeText={(number) => setCode(number)}
        keyboardType={'phone-pad'}
        blurOnSubmit={false}
      />,
    );

    for (let i = 1; i < BackendApi.CodeLength; i++) {
      result.push(
        <TextInput
          key={i}
          ref={refs[i]}
          style={[styles.codeInput, {borderColor: borderColor}]}
          editable={editable}
          onFocus={() =>
            code.length !== i && code.length < BackendApi.CodeLength
              ? refs[code.length].current.focus()
              : {}
          }
          maxLength={1}
          caretHidden={true}
          value={code.length !== i ? code[i] : ''}
          keyboardType={'phone-pad'}
          blurOnSubmit={false}
          onKeyPress={({nativeEvent}) => {
            if (nativeEvent.key == 'Backspace') {
              setCode(code.substring(0, code.length - 1));
            }
          }}
          onChangeText={(number) => {
            setCode(code.substring(0, i) + number);
          }}
        />,
      );
    }
    return result;
  };
  return (
    <View style={styles.box}>
      <Text style={styles.description}>
        {`Confirmation code sent to your ${
          type === BackendApi.CodeType.Phone ? 'phone number' : 'email'
        }`}
      </Text>
      <Text style={styles.id}>
        {type === BackendApi.CodeType.Phone ? '+' : ''}
        {value}
      </Text>
      <View style={{flexDirection: 'row', alignContent: 'center'}}>
        {renderTextInputs()}
      </View>
      {lockTime === 0 ? (
        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resend}>Resend</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.resendTimer}>
          {'Can be resend after ' + renderTime()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  description: {
    width: '80%',
    textAlign: 'center',
    color: '#888888',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  id: {
    color: '#067BCD',
    fontSize: 17,
    fontFamily: 'Roboto-Medium',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginBottom: 30,
  },
  resend: {
    color: '#2AB2E2',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginTop: 30,
  },
  resendTimer: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginTop: 30,
  },
  codeInput: {
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    width: 50,
    height: 50,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 13,
    fontSize: 23,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#2AB2E2',
  },
});
