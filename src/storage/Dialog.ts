import { createContext } from "react";

enum Action {
  OPEN,
  CLOSE
}
export const initialState = { title: "", text: "", visible: false }

export const Context = createContext(initialState)
export function reducer(prevState: any, action: any) {
  switch (action.type) {
    case Action.OPEN:
      return {
        ...prevState,
        title: action.title,
        text: action.text,
        onPress: action.onPress,
        visible: true
      };
    case Action.CLOSE:
      return {
        ...prevState,
        visible: false
      };
  }
}

export const open = (title: string, text: string, onPress: () => void) => (
  {
    type: Action.OPEN,
    title: title,
    text: text,
    onPress: onPress
  }
)
export const close = () => (
  {
    type: Action.CLOSE
  }
)