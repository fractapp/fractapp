import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Dialog from 'storage/Dialog';
import GlobalStore from 'storage/Global';
import BackendApi from 'utils/api';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

/**
 * Confirm code screen
 * @category Screens
 */
export const ConfirmCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const dispatch = useDispatch();

  const [code, setCode] = useState<string>('');
  const [editable, setEditable] = useState<boolean>(true);
  const [lockTime, setLockTime] = useState<number>(60);
  const [borderColor, setBorderColor] = useState<string>('#CCCCCC');

  const value: string = route.params.value;
  const type: BackendApi.CodeType = route.params.type;
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

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
    }

    if (code.length < BackendApi.CodeLength) {
      if (!refs[code.length] || !refs[code.length].current) {
        throw new Error('invalid ref for confirm code ' + code.length);
      }

      refs[code.length]?.current?.focus();
    } else if (code.length === BackendApi.CodeLength) {
      Keyboard.dismiss();

      (async () => {
        setEditable(false);
        setBorderColor('#2AB2E2');

        try {
          dispatch(GlobalStore.actions.showLoading());

          const rsCode = await BackendApi.auth(type, value, code);
          switch (rsCode) {
            case 400:
              dispatch(
                Dialog.actions.showDialog({
                    title: StringUtils.texts.ServiceUnavailableTitle,
                    text: '',
                    onPress: () => dispatch(Dialog.actions.hideDialog()),
                  },
                ),
              );

              setCode('');
              setBorderColor('#EA4335');
              break;
            case 403:
              navigation.goBack();
              dispatch(
                Dialog.actions.showDialog({
                    title: StringUtils.texts.DifferentAddressTitle,
                    text: '',
                    onPress: () => dispatch(Dialog.actions.hideDialog()),
                  },
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
              dispatch(GlobalStore.actions.signInFractapp());

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
          setCode('');
          setBorderColor('#EA4335');
        }

        setEditable(true);
        dispatch(GlobalStore.actions.hideLoading());
      })();
    }
  }, [code]);

  const onResend = async () => {
    setLockTime(60);
    setTimeout(() => tick(60), 1000);

    const rsCode = await BackendApi.sendCode(
      value,
      type,
    );
    switch (rsCode) {
      case 400:
        dispatch(
          Dialog.actions.showDialog({
              title: StringUtils.texts.ServiceUnavailableTitle,
              text: '',
              onPress: () => dispatch(Dialog.actions.hideDialog()),
            },
          ),
        );
        break;
      case 404:
        dispatch(
          Dialog.actions.showDialog({
              title:  type === BackendApi.CodeType.Phone
                ? StringUtils.texts.InvalidPhoneNumberTitle
                : StringUtils.texts.InvalidEmailTitle,
              text:  type === BackendApi.CodeType.Phone
                ? StringUtils.texts.InvalidPhoneNumberText
                : StringUtils.texts.InvalidEmailText,
              onPress: () => dispatch(Dialog.actions.hideDialog()),
            },
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
          code.length !== 0 ? refs[code.length]?.current?.focus() : {}
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
            code.length !== i &&
            code.length < BackendApi.CodeLength &&
            code.length !== 6
              ? refs[code.length]?.current?.focus()
              : {}
          }
          maxLength={1}
          caretHidden={true}
          value={code.length !== i ? code[i] : ''}
          keyboardType={'phone-pad'}
          blurOnSubmit={false}
          onKeyPress={({nativeEvent}) => {
            if (nativeEvent.key === 'Backspace') {
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
        {type === BackendApi.CodeType.Phone
          ? StringUtils.texts.ConfirmationCodePhoneNumberText
          : StringUtils.texts.ConfirmationCodeEmailText}
      </Text>
      <Text style={styles.id}>
        {type === BackendApi.CodeType.Phone ? '+' : ''}
        {value}
      </Text>
      <View style={{flexDirection: 'row', alignContent: 'center'}}>
        {renderTextInputs()}
      </View>
      {lockTime <= 0 ? (
        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resend}>{StringUtils.texts.ResendTitle}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.resendTimer}>
          {`${StringUtils.texts.ResendText} ${renderTime()}`}
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
