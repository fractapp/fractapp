import React, { useState, useContext } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Transaction, TxType } from 'models/transaction';
import { getLogo, getSymbol, Wallet } from 'models/wallet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WalletInfo } from 'components/';

export const TransactionDetails = ({ route }: { route: any }) => {
    const tx: Transaction = route.params.transaction
    const wallet: Wallet = route.params.wallet

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center" }}>
            <View style={styles.info}>
                <Image
                    source={getLogo(tx.currency)}
                    style={styles.logo}
                />
                <Text style={styles.address}>{tx.member}</Text>
                <Text style={styles.value}>{tx.txType == TxType.Sent ? "-" : "+"}{tx.value} {getSymbol(tx.currency)}</Text>
                <View style={styles.status}>
                    <MaterialIcons name="done" size={25} color="#888888" />
                    <Text style={styles.statusText}>Success</Text>
                </View>
            </View>

            <View style={{ width: '100%', marginTop: 30 }}>
                <Text style={[styles.title, { marginBottom: 10 }]}>Write-off account</Text>
                <WalletInfo wallet={wallet} />
            </View>

            <View style={{ width: '100%', flexDirection: 'row', marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { marginBottom: 5 }]}>Date</Text>
                    <Text style={styles.dateAndFee}>{tx.date.toLocaleDateString()} {tx.date.toLocaleTimeString()}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <View>
                        <Text style={[styles.title, { marginBottom: 5 }]}>Fee</Text>
                        <Text style={styles.dateAndFee}>{tx.fee} {getSymbol(tx.currency)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    info: {
        width: '90%',
        marginTop: 20,
        paddingTop: 30,
        paddingBottom: 40,
        borderColor: "#888888",
        borderWidth: 0.5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 75,
        overflow: "hidden"
    },
    address: {
        width: '80%',
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        color: "black",
    },
    value: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 40,
        fontFamily: "Roboto-Regular",
        color: "black",
    },
    status: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusText: {
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        color: "#888888",
    },
    title: {
        marginLeft: 20,
        marginRight: 20,
        alignSelf: 'flex-start',
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        color: "#888888",
    },
    dateAndFee: {
        marginLeft: 20,
        marginRight: 20,
        alignSelf: 'flex-start',
        fontSize: 18,
        fontFamily: "Roboto-Regular",
        color: "black",
    },
});