import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BlueButton} from 'components/index';
import PopDialog, {DialogContent} from 'react-native-popup-dialog';

/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const Dialog = ({
  title,
  text,
  visible,
  onPress,
}: {
  title: string;
  text: string;
  visible: boolean;
  onPress: () => void;
}) => {
  return (
    <PopDialog
      visible={visible}
      width={0.7}
      dialogTitle={<Text style={styles.title}>{title}</Text>}
      footer={
        <View style={styles.btn}>
          <BlueButton text={'OK'} height={40} onPress={onPress} />
        </View>
      }>
      <DialogContent style={styles.dialog}>
        <Text style={styles.description}>{text}</Text>
      </DialogContent>
    </PopDialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    alignItems: 'center',
    padding: 0,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  description: {
    marginTop: 10,
    width: '90%',
    textAlign: 'left',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  btn: {
    marginBottom: 15,
    width: '40%',
    alignSelf: 'center',
  },
});
