import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

/**
 * User's contact in fractapp
 * @category Components
 */
export const Contact = ({
  name,
  img,
  usernameOrPhoneNumber,
}: {
  name: string;
  img: any;
  usernameOrPhoneNumber: string;
}) => {
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
        <View style={{flex: 1, flexDirection: 'column', marginLeft: 10}}>
          <View style={{height: 23, flexDirection: 'row'}}>
            <Text style={[styles.name, {textAlign: 'left'}]}>
              {name.trim() === '' ? usernameOrPhoneNumber : name}
            </Text>
          </View>
          {name.trim() !== '' ? (
            <View style={{height: 23, flexDirection: 'row'}}>
              <Text style={[styles.username, {textAlign: 'left'}]}>
                {usernameOrPhoneNumber}
              </Text>
            </View>
          ) : (
            <></>
          )}
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
    fontSize: 15,
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
