import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlueButton, TextInput, InputType } from 'components';

const WalletEncryption = ({ navigation }: { navigation: any }) => {
    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>Wallet encryption</Text>
            <Text style={styles.description}>Enter the password to encrypt your wallet. Do not lose your password otherwise you will not be able to restore access.</Text>

            <View style={styles.newPassword}>
                <TextInput
                    onChangeText={text => console.log(text)}
                    inputType={InputType.Password}
                    placeholder={"Password"}
                />
            </View>
            <View style={styles.confirmPassword}>
                <TextInput
                    onChangeText={text => console.log(text)}
                    inputType={InputType.Password}
                    placeholder={"Confirm password"}
                />
            </View>

            <View style={{ width: '80%', position: 'absolute', bottom: 40 }}>
                <BlueButton text={"Encrypt"} height={50} onPress={() => navigation.navigate('SettingWallet')} />
            </View>
        </View>
    );
}

export default WalletEncryption

const styles = StyleSheet.create({
    title: {
        marginTop: 80,
        fontSize: 25,
        fontFamily: "Roboto-Regular",
        color: "#2AB2E2",
    },
    description: {
        width: '90%',
        marginTop: 40,
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        color: "#888888",
    },
    newPassword: {
        marginTop: 30,
        width:"90%"
    },
    confirmPassword: {
        marginTop: 20,
        width:"90%"
    }
});