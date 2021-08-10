import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BlueButton} from 'components/BlueButton';
import PopDialog, {DialogContent} from 'react-native-popup-dialog';
import { Dispatch } from 'redux';
import DialogStore from 'storage/Dialog';

/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const Dialog = ({
  dispatch,
  title,
  text,
  visible,
}: {
  dispatch: Dispatch,
  title: string;
  text: string;
  visible: boolean;
}) => {
  return (
    <PopDialog
      visible={visible}
      width={0.7}
      dialogTitle={<Text style={styles.title}>{title}</Text>}
      footer={
        <View style={styles.btnImg}>
          <BlueButton text={'OK'} height={40} onPress={() => dispatch(DialogStore.actions.hideDialog())} />
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
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  description: {
    marginTop: 5,
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  btnImg: {
    marginBottom: 12,
    width: '40%',
    alignSelf: 'center',
  },
});
