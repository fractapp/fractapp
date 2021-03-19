import React, {useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker/src/index';
import backend from 'utils/backend';
import GlobalStore from 'storage/Global';

/**
 * Screen with editing profile in fractapp
 * @category Screens
 */
export const EditProfile = ({navigation}: {navigation: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const Inputs = [
    {
      title: 'Name',
      value: globalContext.state.profile.name,
      placeholder: 'Write your name',
      onClick: () => navigation.navigate('EditName'),
    },
    {
      title: 'Username',
      value: !globalContext.state.profile.username
        ? ''
        : '@' + globalContext.state.profile.username,
      placeholder: 'Write your username',
      onClick: () => navigation.navigate('EditUsername'),
    },
    {
      title: 'Phone',
      value: globalContext.state.profile.phoneNumber,
      placeholder: 'Write your phone',
      onClick: () =>
        globalContext.state.profile.phoneNumber !== '' &&
        globalContext.state.profile.phoneNumber !== undefined
          ? null
          : navigation.navigate('EditPhoneNumber'),
    },
    {
      title: 'Email',
      value: globalContext.state.profile.email,
      placeholder: 'Write your email',
      onClick: () =>
        globalContext.state.profile.email !== '' &&
        globalContext.state.profile.email !== undefined
          ? null
          : navigation.navigate('EditEmail'),
    },
  ];

  const openFilePicker = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 400,
        maxHeight: 400,
      },
      async (rs) => {
        if (rs.base64 == undefined) {
          return;
        }
        globalContext.dispatch(GlobalStore.setLoading(true));

        await backend.uploadAvatar(rs.base64, rs.type!);
        await globalContext.dispatch(GlobalStore.setUpdatingProfile(true));

        globalContext.dispatch(GlobalStore.setLoading(false));
      },
    );
  };
  const renderItem = (item: any) => {
    const input = item.item;
    return (
      <TouchableOpacity key={input.title} onPress={input.onClick}>
        <View style={styles.input}>
          <Text style={styles.title}>{input.title}</Text>
          {input.value !== '' && input.value !== undefined ? (
            <Text style={styles.value}>{input.value}</Text>
          ) : (
            <Text style={styles.placeholder}>{input.placeholder}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.profile}>
      <TouchableOpacity testID={'editAvatarBtn'} onPress={openFilePicker}>
        <Image
          source={
            globalContext.state.profile.avatarExt === ''
              ? require('assets/img/default-avatar.png')
              : {
                  uri: backend.getImgUrl(
                    globalContext.state.profile.id,
                    globalContext.state.profile.avatarExt,
                    globalContext.state.profile.lastUpdate,
                  ),
                }
          }
          style={styles.avatar}
          width={120}
          height={120}
        />
      </TouchableOpacity>
      <View style={{width: '90%'}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={Inputs}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    marginTop: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    marginTop: 30,
    paddingBottom: 5,
    borderColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  value: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
  },
  placeholder: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
});
