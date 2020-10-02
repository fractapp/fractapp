import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WhiteButton, Img } from 'components';
import { mnemonicGenerate } from '@polkadot/util-crypto';

const SaveWallet = ({ navigation }: { navigation: any }) => {
    const seed = mnemonicGenerate().split(" ")
    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center" }}>
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
                        onPress={() => navigation.navigate("SaveSeed")}
                    />
                </View>
                <View style={{ marginTop: 20, width: "90%" }} >
                    <WhiteButton
                        text={"Google disk"}
                        img={Img.GoogleDisk}
                        height={50}
                        onPress={() => alert("")}
                    />
                </View>
            </View>
        </View>
    );
}

export default SaveWallet

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