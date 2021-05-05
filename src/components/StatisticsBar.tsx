import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Currency} from 'types/wallet';
import StringUtils from 'utils/string';

/**
 * Bar with currency share in wallets
 * @category Components
 */
export const StatisticsBar = ({
  distribution,
}: {
  distribution: Map<Currency, number>;
}) => {
  const defaultColor = '#CCCCCC';
  let total = 0;

  for (let value of distribution.values()) {
    total += value;
  }
  total = +total.toFixed(2);
  const getColorByCurrency = (currency: Currency) => {
    let color = '';
    switch (currency) {
      case Currency.DOT:
        color = '#E6007A';
        break;
      case Currency.KSM:
        color = '#888888';
        break;
      default:
        color = defaultColor;
        break;
    }
    return color;
  };

  const renderDistribution = () => {
    const end = {x: -1, y: 0};
    const colors = new Array<string>();

    if (distribution.size === 0 || total === 0) {
      end.x = 1;
      colors.push(defaultColor);
      colors.push(defaultColor);
    } else {
      for (let [currency, value] of distribution) {
        const size = value / total;
        if (end.x === -1) {
          end.x = size;
        }
        colors.push(getColorByCurrency(currency));
      }
      if (colors.length < 2) {
        colors.push(colors[0]);
      }
    }

    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={end}
        locations={[1, 1]}
        colors={colors}
        style={styles.distributionLine}
      />
    );
  };
  return (
    <View style={styles.statistics}>
      <View style={styles.titleBox}>
        <View style={styles.titleBoxElement}>
          <Text style={[styles.title, {textAlign: 'left'}]}>
            {StringUtils.texts.TotalTitle}
          </Text>
        </View>
        <View style={styles.titleBoxElement}>
          <Text style={[styles.title, {textAlign: 'right'}]}>${total}</Text>
        </View>
        {renderDistribution()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statistics: {
    marginTop: 17,
    paddingBottom: 13,
    paddingTop: 7,
    paddingLeft: 25,
    paddingRight: 25,
    width: '95%',
    borderWidth: 0.8,
    borderColor: '#DADADA',
    borderRadius: 7,
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
    fontFamily: 'Roboto-Regular',
    lineHeight: 18,
    color: 'black',
  },
  distributionLine: {
    marginTop: 5,
    width: '100%',
    borderWidth: 0,
    borderRadius: 20,
    height: 10,
  },
});
