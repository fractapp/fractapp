import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Currency, getColor } from 'types/wallet';
import StringUtils from 'utils/string';

/**
 * Bar with currency share in wallets
 * @category Components
 */
export const StatisticsBar = ({
  distribution,
  onPress,
}: {
  distribution: Map<Currency, number>;
  onPress?: () => void;
}) => {
  const defaultColor = '#CCCCCC';
  let total = 0;

  for (let value of distribution.values()) {
    total += value;
  }
  total = +total.toFixed(2);

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
        colors.push(getColor(currency));
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
    <TouchableOpacity style={styles.statistics} onPress={onPress}>
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
    </TouchableOpacity>
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
