import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';

/**
 * @namespace
 * @category Context storage
 */
namespace GlobalStore {
  export enum Action {
    SET,
    SIGN_IN,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION,
    ENABLE_PASSCODE,
    DISABLE_PASSCODE,
    ENABLE_BIOMETRY,
    DISABLE_BIOMETRY,
    SET_SYNCED,
  }

  export type State = {
    notificationCount: number;
    isBiometry: boolean;
    isPasscode: boolean;
    isAuthed: boolean;
    isInitialized: boolean;
    isSynced: boolean;
  };

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const initialState: State = {
    notificationCount: 0,
    isBiometry: false,
    isPasscode: false,
    isAuthed: false,
    isSynced: false,
    isInitialized: false,
  };
  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });
  export function reducer(prevState: State, action: any): State {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.SET:
        return {
          notificationCount: action.notificationCount,
          isBiometry: action.isBiometry,
          isPasscode: action.isPasscode,
          isAuthed: action.isAuthed,
          isSynced: action.isSynced,
          isInitialized: action.isInitialized,
        };
      case Action.SIGN_IN:
        copy.isAuthed = true;
        DB.setAuthed(true);
        break;
      case Action.ADD_NOTIFICATION:
        copy.notificationCount++;

        DB.setNotificationCount(copy.notificationCount);
        break;
      case Action.REMOVE_NOTIFICATION:
        if (copy.notificationCount - action.value < 0) {
          return prevState;
        }
        copy.notificationCount -= action.value;
        DB.setNotificationCount(copy.notificationCount);
        break;
      case Action.SET_SYNCED:
        copy.isSynced = true;
        DB.setSynced(true);
        break;
      case Action.ENABLE_PASSCODE:
        copy.isPasscode = true;
        DB.enablePasscode(action.passcode, false);
        break;
      case Action.DISABLE_PASSCODE:
        copy.isPasscode = false;
        DB.disablePasscode();
        break;
      case Action.ENABLE_BIOMETRY:
        copy.isBiometry = true;
        DB.disablePasscode();
        DB.enablePasscode(action.passcode, true);
        break;
      case Action.DISABLE_BIOMETRY:
        copy.isBiometry = false;
        DB.disablePasscode();
        DB.enablePasscode(action.passcode, false);
        break;
      default:
        return prevState;
    }

    return copy;
  }

  export const set = (
    notificationCount: number,
    isBiometry: boolean,
    isPasscode: boolean,
    isAuthed: boolean,
    isSynced: boolean,
    isInitialized: boolean,
  ) => ({
    type: Action.SET,
    notificationCount: notificationCount,
    isBiometry: isBiometry,
    isPasscode: isPasscode,
    isAuthed: isAuthed,
    isSynced: isSynced,
    isInitialized: isInitialized,
  });

  export const signIn = () => ({
    type: Action.SIGN_IN,
  });
  export const setSynced = () => ({
    type: Action.SET_SYNCED,
  });
  export const addNotificationCount = () => ({
    type: Action.ADD_NOTIFICATION,
  });
  export const removeNotificationCount = (value: number) => ({
    type: Action.REMOVE_NOTIFICATION,
    value: value,
  });
  export const enablePasscode = (passcode: string) => ({
    type: Action.ENABLE_PASSCODE,
    passcode: passcode,
  });
  export const disablePasscode = () => ({
    type: Action.DISABLE_PASSCODE,
  });
  export const enableBiometry = (passcode: string) => ({
    type: Action.ENABLE_BIOMETRY,
    passcode: passcode,
  });
  export const disableBiometry = (passcode: string) => ({
    type: Action.DISABLE_BIOMETRY,
    passcode: passcode,
  });
}
export default GlobalStore;
