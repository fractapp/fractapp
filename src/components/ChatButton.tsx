import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import GlobalStore from 'storage/Global';
import { DefaultMsgAction } from 'types/message';

/**
 * Chat style button
 * @category Components
 */
export const ChatButton = ({
    action,
    width,
    isLast,
    text,
    imageUrl,
    onPress,
  }: {
    action: string,
    width: string,
    isLast: boolean,
    text: string;
    imageUrl: string;
    onPress: () => Promise<void>;
  }) => {

  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState<boolean>();

  const isImgExist = imageUrl !== undefined && imageUrl !== null && imageUrl !== '';

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    console.log('press');
    onPress().finally(() =>  setLoading(false));
  }, [isLoading]);
  return (
    <View style={{ width: width }}>
      <TouchableOpacity
        style={[styles.button, { marginRight: isLast ? 0 : 10 }]}
        onPress={() => {
          if (action === DefaultMsgAction.Broadcast) { //TODO
            dispatch(GlobalStore.actions.showLoading());
          }
          setLoading(true);
        }}>
        {
          isImgExist &&
          <Image source={{ uri: imageUrl }} style={styles.img} />
        }
        <Text style={[styles.buttonText, { maxWidth: isImgExist ? '70%' : '100%' }]}>{text}</Text>
        <View style={styles.loader}>
          {isLoading && <ActivityIndicator testID="loader" size={15} color="#2AB2E2" />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    flex: 1,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2AB2E2',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 5,
    marginBottom: 5,

    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#2F2F2F',
  },
  img: {
    width: '25%',
    aspectRatio: 1,
    marginRight: '5%',
  },
  loader: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
