import {createContext} from 'react';
import {Dispatch} from 'react';

/**
 * @namespace
 * @category Context storage
 */
namespace DialogStore {
  export enum Action {
    OPEN,
    CLOSE,
  }

  type DialogInfo = {
    title: string;
    text: string;
    visible: boolean;
    onPress?: () => void;
  };

  type State = {
    dialog: DialogInfo;
    dispatch?: Dispatch<any>;
  };

  export const initialState: State = {
    dialog: {
      text: '',
      title: '',
      visible: false,
    },
  };

  export const Context = createContext(initialState);
  export function reducer(prevState: any, action: any) {
    switch (action.type) {
      case Action.OPEN:
        return {
          dialog: {
            title: action.title,
            text: action.text,
            onPress: action.onPress,
            visible: true,
          },
        };
      case Action.CLOSE:
        let newDialog = Object.assign({}, prevState).dialog;
        newDialog.visible = false;
        return {
          dialog: newDialog,
        };
    }
  }

  export const open = (title: string, text: string, onPress: () => void) => ({
    type: Action.OPEN,
    title: title,
    text: text,
    onPress: onPress,
  });
  export const close = () => ({
    type: Action.CLOSE,
  });
}
export default DialogStore;
