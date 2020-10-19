import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, Platform, Alert, PermissionsAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { WhiteButton, Img, } from 'components';
import { getFile } from 'utils/backup'
import { FileBackup } from 'models/backup';
import { signIn, signOut } from 'utils/google'
import * as Dialog from 'storage/Dialog'

export const ImportWallet = ({ navigation }: { navigation: any }) => {
    const { dialogStore, diaglogDispatch } = useContext(Dialog.Context)
    const [visible, setVisible] = useState<boolean>(false)

    const openFilePicker = async () => {
        try {
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

            if (!isGaranted)
                return

            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            let file: FileBackup;
            try {
                file = await getFile(res.uri)
            } catch (err) {
                Alert.alert("Error", "Invalid file")
                return
            }

            navigation.navigate("WalletFileImport", { file: file })
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                console.log(err)
            }
        }
    }

    const openFileGoogleDiskPicker = async () => {
        try {
            await signOut()
            await signIn();
            navigation.navigate("GoogleDiskPicker")
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center", marginTop: 40 }}>
            <Text style={styles.title}>Import a wallet</Text>
            <View style={{ width: "100%", alignItems: "center", marginTop: 70 }}>
                <WhiteButton
                    text={"Enter seed"}
                    height={50}
                    img={Img.Key}
                    width="90%"
                    onPress={() => navigation.navigate("ImportSeed")}
                />
                <View style={{ marginTop: 20, width: "90%" }} >
                    <WhiteButton
                        text={"From file"}
                        img={Img.File}
                        height={50}
                        onPress={() => openFilePicker()}
                    />
                </View>
                {
                    Platform.OS == "android" ?
                        <View style={{ marginTop: 20, width: "90%" }} >
                            <WhiteButton
                                text={"Google disk"}
                                img={Img.GoogleDisk}
                                height={50}
                                onPress={() => openFileGoogleDiskPicker()}
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
});