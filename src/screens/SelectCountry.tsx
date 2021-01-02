import React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';
import en from 'react-phone-number-input/locale/en';
import {getCountryCallingCode} from 'react-phone-number-input';

export const SelectCountry = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const renderItem = ({item}) => {
    return (
      <TouchableHighlight
        style={styles.item}
        onPress={() => {
          route.params.onSelect(item);
          navigation.goBack();
        }}
        underlayColor={'#DADADA'}>
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '50%'}}>
            <Text style={[styles.textItem]}>{en[item]}</Text>
          </View>
          <View style={{width: '50%'}}>
            <Text
              style={[
                styles.textItem,
                {alignSelf: 'flex-end', color: '#2AB2E2'},
              ]}>
              +{getCountryCallingCode(item)}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };
  return (
    <View style={styles.box}>
      <FlatList
        style={styles.list}
        data={Object.keys(en).filter((key) => {
          try {
            getCountryCallingCode(key);
            return true;
          } catch (e) {
            return false;
          }
        })}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%',
  },
  item: {
    width: '100%',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textItem: {
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
});
