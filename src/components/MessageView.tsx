import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, Alert } from 'react-native';
import stringUtils from 'utils/string';
import { Button, Message, Row } from 'types/message';
import { ChatButton } from 'components/ChatButton';

/**
 * Message in chats
 * @category Components
 */
export const MessageView = (
  {
    message,
    isOwner,
    isHideAnimation,
    onPressChatBtn,
  }: {
    message: Message,
    isHideAnimation: boolean,
    isOwner: boolean,
    onPressChatBtn: (msgId: string, btn: Button) => Promise<void>
  }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [rows, setRows] = useState<Array<Row>>([]);

  useEffect(() => {
    if (message.value.startsWith('lol')) {
      console.log(isHideAnimation && message.hideBtn && message.rows != null);
      console.log(message.rows == null || message.hideBtn);
      console.log('---------');
    }
    if (isHideAnimation && message.hideBtn && message.rows != null ) {
      Animated.timing(fadeAnim,
        {
          useNativeDriver: false,
          toValue: 0,
          duration: 500,
        }).start(() => setRows([]));
      setRows(message.rows);
      setRows([]);
      return;
    } else if (message.rows == null || message.hideBtn) {
      setRows([]);
      return;
    }

    setRows(message.rows);
  }, [message.hideBtn]);

  const renderBtns = () => {
    let result = [];

    if (rows == null) {
      return <View />;
    }

    let rowIndex = 0;
    for (let row of rows) {
      let btns = [];
      if (!row.buttons) {
        continue;
      }
      let btnCount = row.buttons.length;

      for (let i = 0; i < btnCount; i++) {
        const btn = row.buttons[i];
        btns.push(<ChatButton
          key={message.id + '-' + rowIndex + '-' + i}
          isLast={i === btnCount - 1}
          width={100 / btnCount + '%'}
          text={btn.value}
          imageUrl={btn.imageUrl}
          onPress={() => onPressChatBtn(message.id, btn) }
        />);
      }

      result.push(
        <Animated.View style={{ flexDirection: 'row', opacity: fadeAnim }}>
          {btns}
        </Animated.View>
      );
      rowIndex++;
    }

    if (result.length === 0) {
      return <View />;
    }
    return <View style={{ paddingBottom: 5 }}>{result}</View>;
  };

  return (
    <View style={[styles.box, { alignSelf: isOwner ? 'flex-end' : 'flex-start'}]}>
      <View style={[styles.msgBox, {
      }]}>
        <View style={[styles.msg, {
          backgroundColor: isOwner ? '#2AB2E2' : '#ECECEC',
        }]}>
          <Text style={[styles.text, {
            paddingRight: 30,
            color: isOwner ? 'white' : '#2F2F2F',
          }]}>
            {message.value}
          </Text>

          <Text style={[styles.time, {
            position: 'absolute',
            right: 9,
            bottom: 5,
            color: isOwner ? 'white' : '#888888',
          }]}>
            {stringUtils.forMsg(new Date(message.timestamp))}
          </Text>
        </View>
      </View>
      {renderBtns()}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    maxWidth: '80%',
  },
  msgBox: {
    marginTop: 5,
    marginBottom: 5,
  },
  msg: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  text: {
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    marginRight: 8,
  },
  time: {
    textAlign: 'center',
    marginTop: 7,
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
});
