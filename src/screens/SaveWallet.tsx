import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, Platform, PermissionsAndroid } from 'react-native';
import { WhiteButton, Img } from 'components';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { BackupType } from 'utils/backup'
import { signIn, signOut } from 'utils/google';
import * as Dialog from 'storage/Dialog'

export const SaveWallet = ({ navigation }: { navigation: any }) => {
    const seed = mnemonicGenerate().split(" ")
    const [visible, setVisible] = useState<boolean>(false)
    const { dialogStore, diaglogDispatch } = useContext(Dialog.Context)

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
                diaglogDispatch(
                    Dialog.open(
                        "Setting",
                        "Save your wallet in a safe place. If you lose your wallet, you cannot restore access to it.",
                        () => diaglogDispatch(Dialog.close())
                    )
                )
            }

            isGaranted = false
        }

        if (isGaranted)
            navigation.navigate("WalletFileBackup", { seed: seed, type: BackupType.File })

    }

    const backupGoogleDisk = async () => {
        try {
            await signOut()
            await signIn()
            navigation.navigate("WalletFileBackup", { seed: seed, type: BackupType.GoogleDisk })
        } catch (e) {
            console.log(e)
        }
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
                    Platform.OS == "android" ?
                        <View style={{ marginTop: 20, width: "90%" }} >
                            <WhiteButton
                                text={"Google disk"}
                                img={Img.GoogleDisk}
                                height={50}
                                onPress={backupGoogleDisk}
                            />
                        </View> : null
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