import React, {Dispatch} from 'react';

/**
 * @namespace
 * @category Context storage
 */
namespace AuthStore {
  export enum Action {
    SIGN_IN,
    SIGN_OUT,
    SET_PASSCODE,
    SET_BIOMETRY,
  }

  type State = {
    isBiometry: boolean;
    isPasscode: boolean;
    isSign: boolean;
    dispatch?: Dispatch<any>;
  };

  export const initialState: State = {
    isBiometry: false,
    isPasscode: false,
    isSign: false,
  };
  export const Context = React.createContext(initialState);
  export function reducer(prevState: any, action: any) {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.SET_PASSCODE:
        copy.isPasscode = action.value;
        break;
      case Action.SET_BIOMETRY:
        copy.isBiometry = action.value;
        break;
      case Action.SIGN_IN:
        copy.isSign = true;
        break;
      case Action.SIGN_OUT:
        copy.isSign = false;
        break;
    }

    return copy;
  }
  export const setBiometry = (value: boolean) => ({
    type: Action.SET_BIOMETRY,
    value: value,
  });
  export const setPasscode = (value: boolean) => ({
    type: Action.SET_PASSCODE,
    value: value,
  });
  export const signIn = () => ({
    type: Action.SIGN_IN,
  });
  export const signOut = () => ({
    type: Action.SIGN_OUT,
  });
}
export default AuthStore;
