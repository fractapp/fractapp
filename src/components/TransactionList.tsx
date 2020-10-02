import React, { useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { TransactionInfo } from 'components'
import { Transaction, TxType } from '../models/transaction';

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ] 

const TransactionList = ({ date, transactions }: { date: Date, transactions: Array<Transaction> }) => {
    let viewTxs = new Array<any>()

    for (let i = 0; i < transactions.length; i++) {
        viewTxs.push(<TransactionInfo key={transactions[i].id} transaction={transactions[i]} />)
    }

    let dateValue: string;
    const now = new Date()
    if (now.getFullYear() == date.getFullYear()) {
        dateValue =  date.getDate() + " " + months[date.getMonth()]
    } else {
        dateValue =  date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
    }
    return (
        <View key={dateValue} style={{marginTop: 10}}>
            <Text style={styles.date}>{dateValue}</Text>
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