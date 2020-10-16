import React, { useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { TransactionInfo } from 'components'
import { Transaction, TxType } from '../models/transaction';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const TransactionList = ({ date, transactions }: { date: string, transactions: Array<Transaction> }) => {
    let viewTxs = new Array<any>()

    for (let i = 0; i < transactions.length; i++) {
        viewTxs.push(<TransactionInfo key={transactions[i].id} transaction={transactions[i]} />)
    }
    return (
        <View key={date} style={{ marginTop: 10 }}>
            <Text style={styles.date}>{date}</Text>
            {viewTxs}
        </View>
    );
}

export default TransactionList

const styles = StyleSheet.create({
    date: {
        fontSize: 17,
        marginBottom: 5,
        fontFamily: "Roboto-Bold",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "black",
        marginLeft: "5%"
    },
});