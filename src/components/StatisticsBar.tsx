import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Currency } from '../models/wallet'

const StatisticsBar = ({ distribution }: { distribution: Map<Currency, number> }) => {
    const MininalSize = 2

    const total = (() => {
        let result = 0
        for (let [key, value] of distribution) {
            result += value
        }
        return result
    })()

    const getColorByCurrency = (currency: Currency) => {
        let color = ""
        switch (currency) {
            case Currency.Polkadot:
                color = "#E6007A"
                break;
            case Currency.Kusama:
                color = "#888888"
                break;
            default:
                color = "888888"
                break;
        }
        return color
    }

    const renderDistribution = () => {
        const distributionView = new Array();

        let distributionWithoutMin = new Map<Currency, number>();
        let roundTotal = 0
        for (let [currency, value] of distribution) {
            const size = value / total * 100
            if (size < MininalSize) {
                continue
            }
            roundTotal += value
            distributionWithoutMin.set(currency, value)
        }

        const distributionSize = distributionWithoutMin.size
        if (distributionSize == 0) {
            let defaultColor = "#f0f0f0"
            distributionView.push(<View style={[styles.distributionStart, { borderColor: defaultColor, backgroundColor: defaultColor, width: '50%' }]} />)
            distributionView.push(<View style={[styles.distributionEnd, { borderColor: defaultColor, backgroundColor: defaultColor, width: '50%' }]} />)
        } else {
            let index = 0
            for (let [currency, value] of distributionWithoutMin) {
                let color = getColorByCurrency(currency)
                const size = value / roundTotal * 100
                const sizeString = String(size) + "%"

                if (distributionSize == 1) {
                    distributionView.push(<View key={currency} style={[styles.distributionStart, { borderColor: color, backgroundColor: color, width: '50%' }]} />)
                    distributionView.push(<View key={currency} style={[styles.distributionEnd, { borderColor: color, backgroundColor: color, width: '50%' }]} />)
                } else if (index == 0) {
                    distributionView.push(<View key={currency} style={[styles.distributionStart, { borderColor: color, backgroundColor: color, width: sizeString }]} />)
                } else if (index == distributionSize - 1) {
                    distributionView.push(<View key={currency} style={[styles.distributionEnd, { borderColor: color, backgroundColor: color, width: sizeString }]} />)
                } else {
                    distributionView.push(<View key={currency} style={[styles.distributionMid, { borderColor: color, backgroundColor: color, width: sizeString }]} />)
                }
                index++
            }
        }

        return (
            <View style={styles.distribution}>
                {distributionView}
            </View>
        )
    }
    return (
        <View style={styles.statistics}>
            <View style={styles.titleBox}>
                <View style={styles.titleBoxElement}>
                    <Text style={[styles.title, { textAlign: "left" }]}>Total</Text>
                </View>
                <View style={styles.titleBoxElement}>
                    <Text style={[styles.title, { textAlign: "right" }]}>{total}$</Text>
                </View>
                {renderDistribution()}
            </View>
        </View>
    );
}

export default StatisticsBar

const styles = StyleSheet.create({
    statistics: {
        marginTop: 17,
        paddingBottom: 13,
        paddingTop: 7,
        paddingLeft: 25,
        paddingRight: 25,
        width: '95%',
        borderWidth: 0.8,
        borderColor: "#DADADA",
        borderRadius: 7
    },
    titleBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    titleBoxElement: {
        width: '50%',
    },
    title: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        lineHeight: 18,
        color: "black"
    },
    distribution: {
        marginTop: 5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    distributionStart: {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        height: 10
    },
    distributionMid: {
        height: 10
    },
    distributionEnd: {
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        width: '30%',
        height: 10
    }
});