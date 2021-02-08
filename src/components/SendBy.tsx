import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

/**
 * @category Components
 */
export const SendBy = ({title, img}: {title: string; img: any}) => {
  return (
    <View style={styles.account}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: '5%',
          marginRight: '3%',
        }}>
        <Image source={img} style={styles.logo} />
        <View style={{marginLeft: 10}}>
          <Text style={[styles.name, {textAlign: 'left'}]}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  account: {
    height: 80,
    width: '100%',
  },
  logo: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Roboto-Regukar',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  username: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
});
