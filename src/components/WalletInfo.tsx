import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image } from 'react-native';
import { Wallet } from 'rmodels/wallet';

const WalletInfo = ({ navigation, account }: { navigation: any, account: Wallet }) => {
    return (
        <View style={{ width: '100%', justifyContent: 'center' }}>
            <TouchableHighlight
                key={account.symbol}
                onPress={() => navigation.navigate('WalletDetails')}
                underlayColor="#f8f9fb"
            >
                <View style={styles.account}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Image
                            source={account.logo}
                            style={styles.logo}
                        />
                        <View style={{ flex: 1, flexDirection: 'column-reverse', marginLeft: 20 }}>
                            <View style={{ height: 25, flexDirection: 'row' }} >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.balance, { textAlign: "left" }]}>{account.balance} {account.symbol}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.balance, { textAlign: "right" }]}>{account.usdValue}$</Text>
                                </View>
                            </View>
                            <Text style={styles.accountName}>{account.name}</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        </View>
    );
}

export default WalletInfo

const styles = StyleSheet.create({
    account: {
        height: 50,
        paddingLeft: '5%',
        width: '95%',
        marginTop: 10,
        marginBottom: 10
    },
    accountName: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        fontWeight: "normal",
        lineHeight: 18,
        color: "black"
    },
    balance: {
        fontSize: 15,
        fontFamily: "Roboto-Bold",
        fontStyle: "normal",
        lineHeight: 18,
        color: "black"
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 75,
        overflow: "hidden"
    }
});