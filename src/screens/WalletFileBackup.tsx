import React, { useState, useContext, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { BlueButton, PasswordInput, InputType, Loader } from 'components';
import { createAccounts } from 'utils/db'
import { backup, BackupType, GoogleDiskFolder } from 'utils/backup'
import * as Auth from 'storage/Auth'
import * as Dialog from 'storage/Dialog'

const minPasswordLength = 6

export const WalletFileBackup = ({ navigation, route }: { navigation: any, route: any }) => {
    const { authStore, authDispatch } = useContext(Auth.Context)
    const { dialogStore, diaglogDispatch } = useContext(Dialog.Context)

    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isBackup, setBackup] = useState<boolean>(false)

    const seed: string = route.params.seed.join(" ")
    const type: BackupType = route.params.type

    const startBackup = async () => {
        setLoading(true)
        setBackup(true)
    }

    const signIn = async () => {
        await diaglogDispatch(Dialog.close())
        authDispatch(Auth.signIn())
    }

    useEffect(() => {
        if (!isBackup)
            return

        backup(seed, password, type).then(async (info) => {
            if (!info.isSuccess) {
                setLoading(false)
                return
            }

            await createAccounts(seed)

            if (Platform.OS == "android") {
                switch (type) {
                    case BackupType.File:
                        diaglogDispatch(
                            Dialog.open("Success save file", `Save your wallet in a safe place. File: ${info.fileName}`, signIn)
                        )
                        break
                    case BackupType.GoogleDisk:
                        diaglogDispatch(
                            Dialog.open(
                                "Success google disk",
                                `Save your wallet in a safe place. Folder: ${GoogleDiskFolder}. File: ${info.fileName}`,
                                signIn
                            )
                        )
                        break
                }
            } else {
                await signIn()
            }
        })
    }, [isBackup])

    const renderButtonOrError = () => {
        if (confirmPassword == "" || password == "") {
            return null
        } else if (password.length < minPasswordLength && password != "" && confirmPassword != "")
            return <Text style={styles.error}>Minimum password length is 6 characters</Text>
        else if (password != confirmPassword)
            return <Text style={styles.error}>Password do not match</Text>

        return (
            <View style={{ width: '80%', position: 'absolute', bottom: 40 }}>
                <BlueButton text={"Encrypt"} height={50} onPress={startBackup} />
            </View>
        )
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center", marginTop: 40 }}>
            <Text style={styles.title}>Wallet encryption</Text>
            <Text style={styles.description}>Enter the password to encrypt your wallet. Do not lose your password otherwise you will not be able to restore access.</Text>

            <View style={styles.newPassword}>
                <PasswordInput
                    onChangeText={(value: string) => setPassword(value)}
                    inputType={InputType.Password}
                    placeholder={"Password"}
                    defaultValue={password}
                />
            </View>
            <View style={styles.confirmPassword}>
                <PasswordInput
                    onChangeText={(value: string) => setConfirmPassword(value)}
                    inputType={InputType.Password}
                    placeholder={"Confirm password"}
                    defaultValue={confirmPassword}
                />
            </View>
            {renderButtonOrError()}
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