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
import StringUtils from 'utils/string';

/**
 * Screen with editing profile in fractapp
 * @category Screens
 */
export const EditProfile = ({navigation}: {navigation: any}) => {
  const globalContext = useContext(GlobalStore.Context);
  const Inputs = [
    {
      title: StringUtils.texts.edit.profile.nameTitle,
      value: globalContext.state.profile.name,
      placeholder: StringUtils.texts.edit.profile.namePlaceholder,
      onClick: () => navigation.navigate('EditName'),
    },
    {
      title: StringUtils.texts.edit.profile.usernameTitle,
      value: !globalContext.state.profile.username
        ? ''
        : '@' + globalContext.state.profile.username,
      placeholder: StringUtils.texts.edit.profile.usernamePlaceholder,
      onClick: () => navigation.navigate('EditUsername'),
    },
    {
      title: StringUtils.texts.edit.profile.phoneTitle,
      value: globalContext.state.profile.phoneNumber,
      placeholder: StringUtils.texts.edit.profile.phonePlaceholder,
      onClick: () =>
        globalContext.state.profile.phoneNumber !== '' &&
        globalContext.state.profile.phoneNumber !== undefined
          ? null
          : navigation.navigate('EditPhoneNumber'),
    },
    {
      title: StringUtils.texts.edit.profile.emailTitle,
      value: globalContext.state.profile.email,
      placeholder: StringUtils.texts.edit.profile.emailPlaceholder,
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
        if (rs.base64 === undefined) {
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
          source={{
            uri: backend.getImgUrl(
              globalContext.state.profile.id,
              globalContext.state.profile.lastUpdate,
            ),
          }}
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
