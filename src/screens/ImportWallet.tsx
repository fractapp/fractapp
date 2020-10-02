import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WhiteButton, Img } from 'components';

const ImportWallet = ({ navigation }: { navigation: any }) => {
    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>Import a wallet</Text>
            <View style={{ width: "100%", alignItems: "center", marginTop: 70 }}>
                <WhiteButton
                    text={"Enter seed"}
                    height={50}
                    img={Img.Key}
                    width="90%"
                    onPress={() => navigation.navigate("WalletEncryption")}
                />
                <View style={{ marginTop: 20, width: "90%" }} >
                    <WhiteButton
                        text={"From file"}
                        img={Img.File}
                        height={50}
                        onPress={() => alert("")}
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

export default ImportWallet

const styles = StyleSheet.create({
    title: {
        marginTop: 80,
        fontSize: 25,
        fontFamily: "Roboto-Regular",
        color: "#2AB2E2",
    },
});