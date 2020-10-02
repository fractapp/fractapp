import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableHighlight, ScrollView } from 'react-native';
import { Wallet, Currency } from 'models/wallet'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transaction, TxType } from 'models/transaction';
import { WalletDetailsInfo, TransactionList } from "components";

const WalletDetails = () => {
    const transactionsByData = new Map<Date, Array<Transaction>>([
        [new Date(2020, 3, 2), 
            [
                new Transaction("14", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Sent, new Date("01-01-12"), 100),
                new Transaction("12", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Received, new Date("01-01-12"), 100),
                new Transaction("13", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.None, new Date("01-01-12"), 100)
            ]
        ],
        [new Date(2020, 4, 15), [new Transaction("2", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Received, new Date("01-01-12"), 34)]],
        [new Date(2019, 3, 3), [new Transaction("3", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Sent, new Date("01-01-12"), 13.4)]],
        [new Date(2019, 2, 3), [new Transaction("4", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Sent, new Date("01-01-12"), 14)]],
        [new Date(2018, 3, 2), 
            [
                new Transaction("55", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Sent, new Date("01-01-12"), 100),
                new Transaction("52", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.Received, new Date("01-01-12"), 100),
                new Transaction("53", "13cJKQfRqu5FF3ZcN1jLhetqEVwm6mMkJXuTnQrYYcVyryJo", Currency.Polkadot, TxType.None, new Date("01-01-12"), 100)
            ]
        ],
    ]);

    const viewTxs = new Array<any>()
    for (let [date, transactions] of transactionsByData) {
        viewTxs.push(<TransactionList key={date.toString()} date={date} transactions={transactions} />)
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
            <WalletDetailsInfo account={new Wallet("Polkadot Wallet", "0x2", Currency.Polkadot, 1000)} />
            <View style={styles.btns}>
                <View>
                    <TouchableHighlight
                        onPress={() => alert("")}
                        underlayColor="#f8f9fb"
                        style={styles.btn}
                    >
                        <MaterialCommunityIcons name="upload-outline" size={24} color="#666666" />
                    </TouchableHighlight>
                    <Text style={styles.btnText}>Send</Text>
                </View>
                <View style={{ marginLeft: 30 }}>
                    <TouchableHighlight
                        onPress={() => alert("")}
                        underlayColor="#f8f9fb"
                        style={[styles.btn]}
                    >
                        <MaterialCommunityIcons name="download-outline" size={24} color="#666666" />
                    </TouchableHighlight>
                    <Text style={styles.btnText}>Receive</Text>
                </View>
            </View>
            <View style={styles.dividingLine} />
            <View style={styles.transactions}>
                {viewTxs}
            </View>
        </ScrollView>
    );
}

export default WalletDetails

const styles = StyleSheet.create({
    btns: {
        marginTop: 30,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    btn: {
        width: 70,
        height: 70,
        backgroundColor: "#F0EEEE",
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        paddingTop: 2,
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        textAlign: 'center',
        color: "black"
    },
    dividingLine: {
        alignSelf: 'center',
        marginTop: 25,
        width: '90%',
        height: 1,
        backgroundColor: '#cccccc'
    },
    transactions: {
        alignSelf: 'center',
        marginTop: 15,
        width: '100%',
    }
});