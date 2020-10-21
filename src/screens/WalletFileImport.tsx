import React, { useState, useContext, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, Linking, Alert } from 'react-native';
import { BlueButton, PasswordInput, InputType, Loader } from 'components';
import { createAccounts } from 'utils/db'
import { getSeed, BackupType } from 'utils/backup'
import { FileBackup } from 'models/backup';
import * as Auth from 'storage/Auth'

export const WalletFileImport = ({ navigation, route }: { navigation: any, route: any }) => {
    const { authStore, authDispatch } = useContext(Auth.Context)

    const [password, setPassword] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isImport, setImport] = useState<boolean>(false)

    const file: FileBackup = route.params.file

    const startImport = async () => {
        setLoading(true)
        setImport(true)
    }

    useEffect(() => {
        if (!isImport)
            return

        (async () => {
            let seed = ""
            try {
                seed = await getSeed(file, password)
            } catch (e) {
                console.log(e)
                Alert.alert("Invalid password")
                return
            }

            await createAccounts(seed)
            authDispatch(Auth.signIn());
        })()

    }, [isImport])

    if (isLoading) {
        return <Loader />
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center", marginTop: 40 }}>
            <Text style={styles.title}>Wallet decryption</Text>
            <Text style={styles.description}>Enter the password to encrypt your wallet. Do not lose your password otherwise you will not be able to restore access.</Text>

            <View style={styles.newPassword}>
                <PasswordInput
                    onChangeText={(value: string) => setPassword(value)}
                    inputType={InputType.Password}
                    placeholder={"Password"}
                />
            </View>

            <View style={{ width: '80%', position: 'absolute', bottom: 40 }}>
                <BlueButton text={"Decrypt"} height={50} onPress={startImport} />
            </View>
        </View>
    );
}


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
        width: "90%"
    },
    confirmPassword: {
        marginTop: 20,
        width: "90%"
    },
    error: {
        marginTop: 20,
        color: "red",
        fontFamily: "Roboto-Regular",
        fontSize: 15
    }
});