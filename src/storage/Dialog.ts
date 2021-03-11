import {createContext, Dispatch} from 'react';

/**
 * @namespace
 * @category Context storage
 */
namespace DialogStore {
  export enum Action {
    OPEN,
    CLOSE,
  }

  type State = {
    title: string;
    text: string;
    visible: boolean;
    onPress?: () => void;
  };

  export const initialState = (): State => ({
    text: '',
    title: '',
    visible: false,
  });

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const Context = createContext<ContextType>({
    state: initialState(),
    dispatch: () => null,
  });

  export function reducer(prevState: State, action: any): State {
    switch (action.type) {
      case Action.OPEN:
        return {
          title: action.title,
          text: action.text,
          onPress: action.onPress,
          visible: true,
        };
      case Action.CLOSE:
        let newDialog = Object.assign({}, prevState);
        newDialog.visible = false;
        return newDialog;
      default:
        return prevState;
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
