import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableHighlight, ScrollView, Alert, SectionList } from 'react-native';
import { Wallet, Currency } from 'models/wallet'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Transaction, TxType } from 'models/transaction';
import { WalletDetailsInfo, TransactionInfo } from "components";
import { Api } from "utils/polkadot"
import * as dateUtils from 'utils/date'
import * as db from 'utils/db'

const WalletDetails = ({ navigation, route }: { navigation: any, route: any }) => {
    const [transactions, setTransactions] = useState<Map<string, Map<string, Transaction>>>(new Map())
    const [isLoading, setLoading] = useState<boolean>(false)
    const [lastPage, setLastPage] = useState<number>(1)
    const wallet: Wallet = route.params.wallet

    const updateTxs = async (page: number = 1, size: number = 2) => {
        if (isLoading)
            return

        setLoading(true)

        const api = await Api.getInstance(wallet.currency)
        //TODO address
        let txs = await db.getTransactions(wallet.address, page, size)

        //TODO page = 1 
        //TODO добавление новых транзакций
        /* if (txs.length == 0) {
             setLoading(false)
             return
         }*/
        if (txs.length == 0) {
            console.log("get: " + page)
            txs = await api.getTransactions(wallet.address, page, size)
            await db.addTransaction(wallet.address, txs)
        }
        const now = new Date()
        let transactionsMap = new Map(transactions)
        for (let i = 0; i < txs.length; i++) {
            let dateValue = dateUtils.toTitle(now, txs[i].date)
            if (!transactionsMap.has(dateValue))
                transactionsMap.set(dateValue, new Map<string, Transaction>())

            transactionsMap.get(dateValue)?.push(txs[i])
        }

        setLastPage(page)
        setTransactions(transactionsMap)
        setLoading(false)
    }

    useEffect(() => {
        updateTxs()
    }, [])

    const getSections = (map: Map<string, Map<string, Transaction>>) => {
        let sections = new Array()
        for (const [key, value] of map) {
            const txs = new Array<Transaction>()
            for (const [id, tx] of value) {
                txs.push(tx)
            }
            sections.push(
                {
                    title: key,
                    data: txs
                }
            )
        }
        return sections
    }

    return (
        <View style={{ width: "100%" }}>
            <SectionList
                ListHeaderComponent={() =>
                    <View>
                        <WalletDetailsInfo wallet={wallet} />
                        <View style={styles.btns}>
                            <View>
                                <TouchableHighlight
                                    onPress={() => Alert.alert("Milestone 3.1 (Chat)")}
                                    underlayColor="#f8f9fb"
                                    style={styles.btn}
                                >
                                    <MaterialCommunityIcons name="upload-outline" size={24} color="#666666" />
                                </TouchableHighlight>
                                <Text style={styles.btnText}>Send</Text>
                            </View>
                            <View style={{ marginLeft: 30 }}>
                                <TouchableHighlight
                                    onPress={() => navigation.navigate('Receive', { address: wallet.address, currency: wallet.currency })}
                                    underlayColor="#f8f9fb"
                                    style={[styles.btn]}
                                >
                                    <MaterialCommunityIcons name="download-outline" size={24} color="#666666" />
                                </TouchableHighlight>
                                <Text style={styles.btnText}>Receive</Text>
                            </View>
                        </View>
                        <View style={styles.dividingLine} />
                    </View>
                }
                ListFooterComponent={
                    isLoading ?
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <ActivityIndicator size={30} color="#2AB2E2" />
                        </View>
                        : null
                }
                sections={getSections(transactions)}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => <TransactionInfo key={item.id} transaction={item} />}
                onEndReached={() => updateTxs(lastPage + 1)}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.dateTitle}>{title}</Text>
                    </View>
                )}
            />

        </View>
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
    dateTitle: {
        fontSize: 17,
        marginBottom: 5,
        fontFamily: "Roboto-Bold",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "black",
        marginLeft: "5%"
    },
    dividingLine: {
        alignSelf: 'center',
        marginTop: 25,
        width: '90%',
        height: 1,
        backgroundColor: '#cccccc'
    }
});