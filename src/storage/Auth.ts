import React, { Dispatch } from "react";

export enum Action {
  SIGN_IN,
  SIGN_OUT
}

type State = {
  isSign: boolean
  dispatch: Dispatch<any>
};

export const initialState: State = { isSign: false }
export const Context = React.createContext(initialState)
export function reducer(prevState: any, action: any) {
  switch (action.type) {
    case Action.SIGN_IN:
      return {
        isSign: true,
      };
    case Action.SIGN_OUT:
      return {
        isSign: false,
      };
  }
}

export const signIn = () => (
  {
    type: Action.SIGN_IN
  }
)
export const signOut = () => (
  {
    type: Action.SIGN_OUT
  }
)