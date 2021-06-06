import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import stringUtils from 'utils/string';

/**
 * Message in chats
 * @category Components
 */
export const MessageView = ({
  value,
  timestamp,
}: {
  value: string;
  timestamp: number;
}) => {
  return (
    <View style={styles.box}>
      <View style={styles.msg}>
        <Text style={styles.text}>{value}</Text>

        <Text style={styles.time}>
          {stringUtils.forMsg(new Date(timestamp))}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'flex-start',
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  msg: {
    maxWidth: '80%',
    padding: 10,
    backgroundColor: '#9CE5FF',
    borderRadius: 10,
    flexDirection: 'row',
  },
  text: {
    maxWidth: '70%',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'black',
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
    color: 'black',
  },
});
