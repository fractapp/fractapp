import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Backup screen
 * @category Screens
 */
export const Language = () => {
  const menuItems = [
    {
      img: (
        <Image
          source={require('assets/img/google-drive.png')}
          style={{width: 32, height: 32}}
        />
      ),
      title: 'English',
      onClick: () => {
       // dispatch(GlobalStore.actions.setLang('en'));
      },
    },
    {
      img: (
        <MaterialCommunityIcons name="content-copy" size={32} color="#888888" />
      ),
      title: 'Русский',
      onClick: () => {
       //  dispatch(GlobalStore.setLang('ru'));
      },
    },
  ];
  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onClick}>
      {item.img}
      <Text style={styles.menuTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.box}>
      <FlatList
        style={styles.menu}
        ItemSeparatorComponent={() => <View style={styles.dividingLine} />}
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dividingLine: {
    alignSelf: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  description: {
    width: '90%',
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  menu: {
    flex: 1,
    width: '88%',
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
    alignSelf: 'center',
  },
});
