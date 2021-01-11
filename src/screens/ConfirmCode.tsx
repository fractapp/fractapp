import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, TextInput, Text, View, Keyboard} from 'react-native';
import BackendApi from 'utils/backend';
import Dialog from 'storage/Dialog';

export const ConfirmCode = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  //const dialogContext = useContext(Dialog.Context);
  const [code, setCode] = useState<string>('');
  const [editable, setEditable] = useState<boolean>(true);

  const phone = route.params.phone;

  const refs = new Array(2);

  useEffect(() => {
    if (code.length < BackendApi.CodeLength) {
      refs[code.length].focus();
    } else if (code.length == BackendApi.CodeLength) {
      Keyboard.dismiss();
    }
  }, [code]);

  const renderTextInputs = () => {
    const result = new Array();
    result.push(
      <TextInput
        ref={(input) => (refs[0] = input)}
        style={styles.codeInput}
        editable={editable}
        onFocus={() => refs[code.length].focus()}
        value={code.length != 0 ? code[0] : ''}
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
          ref={(input) => (refs[i] = input)}
          style={styles.codeInput}
          editable={editable}
          onFocus={() =>
            code.length != i && code.length < BackendApi.CodeLength
              ? refs[code.length].focus()
              : {}
          }
          maxLength={1}
          caretHidden={true}
          value={code.length != i ? code[i] : ''}
          keyboardType={'phone-pad'}
          blurOnSubmit={false}
          onKeyPress={({nativeEvent}) => {
            if (nativeEvent.key == 'Backspace') {
              refs[0].focus();
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
        Confirmation code sent in sms to your phone:
      </Text>
      <Text style={styles.id}>+{phone}</Text>
      <View style={{flexDirection: 'row', alignContent: 'center'}}>
        {renderTextInputs()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  title: {
    color: '#2AB2E2',
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginBottom: 20,
  },
  description: {
    color: '#888888',
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  id: {
    color: '#067BCD',
    fontSize: 18,
    fontFamily: 'Roboto-Medium',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginBottom: 30,
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
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
