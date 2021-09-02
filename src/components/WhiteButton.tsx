import React from 'react';
import {StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * Image type
 * @category Components
 */
export enum Img {
  None,
  GoogleDrive,
  File,
  Key,
  Copy,

  Phone,
  Email,
  Twitter,
}

/**
 * White style button
 * @category Components
 */
export const WhiteButton = ({
  text,
  height,
  onPress,
  img = Img.None,
  width = '100%',
  color = 'black',
}: {
  text: string;
  height: number;
  onPress: () => void;
  img?: Img;
  width?: string;
  color?: string;
}) => {
  let imageView: any;
  switch (img) {
    case Img.GoogleDrive:
      imageView = (
        <Image
          source={require('assets/img/google-drive.png')}
          style={[styles.img, { width: 30, height: 30 }]}
        />
      );
      break;
    case Img.File:
      imageView = (
        <MaterialIcons
          name="folder-open"
          size={30}
          color="#888888"
          style={styles.img}
        />
      );
      break;
    case Img.Key:
      imageView = (
        <MaterialCommunityIcons
          name="key-outline"
          size={30}
          color="#888888"
          style={styles.img}
        />
      );
      break;
    case Img.Copy:
      imageView = (
        <MaterialCommunityIcons
          name="content-copy"
          size={27}
          color="#888888"
          style={styles.img}
        />
      );
      break;
    case Img.Phone:
      imageView = (
        <Image
          source={require('assets/img/phone.png')}
          style={[styles.img, { width: 30, height: 30 }]}
        />
      );
      break;
    case Img.Email:
      imageView = (
        <Image
          source={require('assets/img/mail.png')}
          style={[styles.img, { width: 30, height: 30 }]}
        />
      );
      break;
    case Img.Twitter:
      imageView = (
        <Image
          source={require('assets/img/twitter-round.png')}
          style={[styles.img, { width: 30, height: 30 }]}
        />
      );
      break;
  }

  return (
    <TouchableOpacity
      style={[styles.button, { height: height, width: width, borderColor: color }]}
      onPress={onPress}
    >
      {imageView}
      <Text style={[styles.buttonText, {color: color}]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  img: {
    position: 'absolute',
    left: 70,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  button: {
    borderWidth: 0.5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
