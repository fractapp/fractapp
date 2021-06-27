import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import stringUtils from 'utils/string';
/**
 * Message in chats
 * @category Components
 */
export const MessageView = (
  {
    value,
    timestamp,
    isOwner,
  }: {
    value: string;
    timestamp: number;
    isOwner: boolean
  }) => {
  return (
    <View style={[styles.box, {
      alignItems: isOwner ? 'flex-end' : 'flex-start',
    }]}>
      <View style={[styles.msg, {
        backgroundColor: isOwner ? '#2AB2E2' : '#ECECEC',
      }]}>
        <Text style={[styles.text, {
          color: isOwner ? 'white' : '#2F2F2F',
        }]}>{value}</Text>

        <Text style={[styles.time, {
          color: isOwner ? 'white' : '#888888',
        }]}>
          {stringUtils.forMsg(new Date(timestamp))}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginTop: 5,
    marginBottom: 5,
  },
  msg: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  text: {
    maxWidth: '70%',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginRight: 8,
  },
  time: {
    alignSelf: 'flex-end',
    textAlign: 'center',
    marginTop: 7,
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
});
