import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * @namespace
 * @category Storage
 */
namespace DialogStore {
  type Dialog = {
    title: string,
    text: string;
    visible: boolean;
  }
  export type State = {
    dialog: Dialog
  };

  export const initialState = (): State => ({
    dialog: {
      text: '',
      title: '',
      visible: false,
    },
  });

  const slice = createSlice({
    name: 'dialog',
    initialState: initialState(),
    reducers: {
      showDialog(state: State, action: PayloadAction<{
        title: string,
        text: string;
      }>): State {
        state.dialog = {
          title: action.payload.title,
          text: action.payload.text,
          visible: true,
        };
        return state;
      },
      hideDialog(state: State): State {
        state.dialog.visible = false;
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default DialogStore;
