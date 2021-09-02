import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

/**
 * Chat style button
 * @category Components
 */
export const ChatButton = ({
    width,
    isLast,
    text,
    imageUrl,
    onPress,
  }: {
    width: string,
    isLast: boolean,
    text: string;
    imageUrl: string;
    onPress: () => Promise<void>;
  }) => {
  const [isLoading, setLoading] = useState<boolean>();

  const isImgExist = imageUrl !== undefined && imageUrl !== null && imageUrl !== '';
  return (
    <View style={{ width: width }}>
      <TouchableOpacity
        style={[styles.button, { marginRight: isLast ? 0 : 10 }]}
        onPress={async () => {
          setLoading(true);
          await onPress();
          setLoading(false);
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
