import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { StatisticsBar, WalletInfo } from 'components'
import { Wallet, Currency } from 'models/wallet'

const Wallets = ({ navigation }: { navigation: any }) => {
    const distribution = new Map<Currency, number>([
        [Currency.Polkadot, 500],
        [Currency.Kusama, 2000],
    ])
    const accounts = new Array<Wallet>(
        new Wallet("Polkadot Wallet", "0x2", Currency.Polkadot, 1000),
        new Wallet("Kusams Wallet", "0x3", Currency.Kusama, 1000),
    )

    const renderAccounts = () => {
        const result = new Array();
        for (let i = 0; i < accounts.length; i++) {
            result.push(<WalletInfo navigation={navigation} key={accounts[i].address} account={accounts[i]} />)
        }
        return result
    }

    return (
        <View style={styles.wallet}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <StatisticsBar distribution={distribution} />
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