import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, PermissionsAndroid } from 'react-native';
import { WhiteButton, Img } from 'components';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import backupUtil from 'utils/backup';
import googleUtil from 'utils/google';
import Dialog from 'storage/Dialog'

export const SaveWallet = ({ navigation }: { navigation: any }) => {
    const seed = mnemonicGenerate().split(" ")
    const dialogContext = useContext(Dialog.Context)

    const backupFile = async () => {
        const statues = await PermissionsAndroid.requestMultiple(
            [
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            ]
        );
        let isGaranted = true
        for (let key in statues) {
            const status = statues[key]
            if (status == "granted") {
                continue
            }

            if (status == "never_ask_again") {
                dialogContext.dispatch(
                    Dialog.open(
                        "Setting",
                        "Save your wallet in a safe place. If you lose your wallet, you cannot restore access to it.",
                        () => dialogContext.dispatch(Dialog.close())
                    )
                )
            }

            isGaranted = false
        }

        if (isGaranted)
            navigation.navigate("WalletFileBackup", { seed: seed, type: backupUtil.BackupType.File })

    }

    const backupGoogleDrive = async () => {
        await googleUtil.signOut()
        await googleUtil.signIn()
        navigation.navigate("WalletFileBackup", { seed: seed, type: backupUtil.BackupType.GoogleDrive })
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center", marginTop: 40 }}>
            <Text style={styles.title}>Save a wallet</Text>
            <Text style={styles.description}>Save your wallet in a safe place. If you lose your wallet, you cannot restore access to it.</Text>
            <View style={{ width: "100%", alignItems: "center", marginTop: 30 }}>
                <WhiteButton
                    text={"Backup seed"}
                    height={50}
                    img={Img.Copy}
                    width="90%"
                    onPress={() => navigation.navigate("SaveSeed", { seed: seed })}
                />
                <View style={{ marginTop: 20, width: "90%" }} >
                    <WhiteButton
                        text={"Encrypted file"}
                        img={Img.File}
                        height={50}
                        onPress={backupFile}
                    />
                </View>
                {
                    <View style={{ marginTop: 20, width: "90%" }} >
                        <WhiteButton
                            text={"Google drive"}
                            img={Img.GoogleDrive}
                            height={50}
                            onPress={backupGoogleDrive}
                        />
                    </View>
                }
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
    }
});