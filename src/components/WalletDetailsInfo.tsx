import React, { useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { getLogo, getSymbol, Wallet } from 'models/wallet'

const WalletDetailsInfo = ({ wallet }: { wallet: Wallet }) => {
    return (
        <View style={styles.accountInfo}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <Image
                    source={getLogo(wallet.currency)}
                    style={styles.logo}
                />
                <View style={{ flex: 1, flexDirection: 'column-reverse', marginLeft: 20 }}>
                    <View style={{ flexDirection: 'row', paddingTop: 5 }} >
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.balance, { textAlign: "left" }]}>{wallet.balance} {getSymbol(wallet.currency)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.balance, { textAlign: "right" }]}>{wallet.usdValue} $</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{wallet.name}</Text>
                </View>
            </View>
        </View>
    );
}
export default WalletDetailsInfo

const styles = StyleSheet.create({
    accountInfo: {
        marginTop: 15,
        alignSelf: 'center',
        width: "85%",
    },
    name: {
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "#888888"
    },
    balance: {
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        color: "black"
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 75,
        overflow: "hidden"
    },
});