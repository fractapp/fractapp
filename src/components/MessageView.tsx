import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
    onPressChatBtn,
  }: {
    message: Message,
    isOwner: boolean,
    onPressChatBtn: (msgId: string, btn: Button) => Promise<void>
  }) => {
  const [rows, setRows] = useState<Array<Row>>([]);

  useEffect(() => {
    if (message.rows == null || message.hideBtn) {
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
          action={btn.action}
          key={message.id + '-' + rowIndex + '-' + i}
          isLast={i === btnCount - 1}
          width={(100 / btnCount) + '%'}
          text={btn.value}
          imageUrl={btn.imageUrl}
          onPress={() => onPressChatBtn(message.id, btn) }
        />);
      }

      result.push(
        <View style={{ flexDirection: 'row' }}>
          {btns}
        </View>
      );
      rowIndex++;
    }

    if (result.length === 0) {
      return <View />;
    }
    return <View style={{ paddingBottom: 5 }}>{result}</View>;
  };

  return (
    <View>
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
    </View>
    <View style={[{ maxWidth: '80%' }, { alignSelf: 'flex-end'}]}>
      {renderBtns()}
    </View>
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
