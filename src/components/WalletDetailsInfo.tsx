import React, { useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Wallet } from 'models/wallet'

const WalletDetailsInfo = ({ account }: { account: Wallet }) => {
    return (
        <View style={styles.accountInfo}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <Image
                    source={account.logo}
                    style={styles.logo}
                />
                <View style={{ flex: 1, flexDirection: 'column-reverse', marginLeft: 20 }}>
                    <View style={{ flexDirection: 'row', paddingTop: 2 }} >
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.balance, { textAlign: "left" }]}>{account.balance} {account.symbol}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.balance, { textAlign: "right" }]}>{account.usdValue} $</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{account.name}</Text>
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
        fontSize: 25,
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