import React, { createContext, useReducer } from "react";

export enum Action {
  SIGN_IN,
  SIGN_OUT
}
export const initialState = { isSign: false }
export const Context = React.createContext(initialState)
export function reducer(prevState: any, action: any) {
  switch (action.type) {
    case Action.SIGN_IN:
      return {
        ...prevState,
        isSign: true,
      };
    case Action.SIGN_OUT:
      return {
        ...prevState,
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