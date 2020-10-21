import React from 'react';
import ReactNative, { StyleSheet, TouchableOpacity } from 'react-native';


export const PasswordInput = ({ placeholder, defaultValue = "", width = "100%", onChangeText }:
    { placeholder: string, defaultValue?: string, width?: string, onChangeText: (text: string) => void }) => {

    return (
        <ReactNative.TextInput
            style={[styles.input, { width: width }]}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={"#BFBDBD"}
            autoCompleteType={"password"}
            textContentType={"newPassword"}
            secureTextEntry={true}
            defaultValue={defaultValue}
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