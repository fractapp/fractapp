import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { StatisticsBar, WalletInfo } from 'components'
import { Wallet, Currency } from 'models/wallet'
import * as AccountsStore from 'storage/Accounts';
import * as PricesStore from 'storage/Prices';

const Wallets = ({ navigation }: { navigation: any }) => {
    const { accountsStore, accountsDispatch } = useContext(AccountsStore.Context)
    const { pricesStore, pricesDispatch } = useContext(PricesStore.Context)

    const renderAccounts = () => {
        const result = new Array();
        const wallets = new Array<Wallet>();
        for (let [currency, account] of accountsStore.accounts) {
            let price = pricesStore.prices.get(currency)
            if (price == undefined)
                price = 0

            wallets.push(new Wallet(account.name, account.address, account.currency, account.balance, price))
        }

        for (let i = 0; i < wallets.length; i++) {
            result.push(<WalletInfo navigation={navigation} key={wallets[i].address} wallet={wallets[i]} />)
        }
        return result
    }

    const distribution = () => {
        let distribution = new Map<Currency, number>()
        for (let [currency, account] of accountsStore.accounts) {
            let price = pricesStore.prices.get(currency)
            if (price == undefined)
                price = 0
    
            distribution.set(currency, account.balance * price)
        }
        return distribution
    }

    return (
        <View style={styles.wallet}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <StatisticsBar distribution={distribution()} />
                    <View style={styles.accounts} >
                        {renderAccounts()}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default Wallets

const styles = StyleSheet.create({
    wallet: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accounts: {
        marginTop: 40,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dividingLine: {
        width: '80%',
        marginBottom: 10,
        marginTop: 10,
        height: 1,
        backgroundColor: '#ededed'
    }
});