import React from 'react';
import ReactNative, { StyleSheet, TouchableOpacity } from 'react-native';

export enum InputType {
    Password
}

export const TextInput = ({ placeholder, inputType = InputType.Password, width = "100%", onChangeText }: { placeholder: string, inputType: InputType, width: string, onChangeText: (text: string) => void}) => {
    return (
        <ReactNative.TextInput
            style={[styles.input, { width: width }]}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={"#BFBDBD"}
            autoCompleteType={"password"}
            textContentType={"newPassword"}
            secureTextEntry={true}
        />
    );
}


const styles = StyleSheet.create({
    input: {
        borderColor: '#CCCCCC', 
        borderBottomWidth: 1,
        height: 40,
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "black"
    },
});