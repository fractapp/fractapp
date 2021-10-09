import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConfirmTxInfo } from 'types/inputs';
import { Currency } from 'types/wallet';
import { TxAction, TxStatus, TxType } from 'types/transaction';

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
  type ConfirmTxInfoDialog = {
    isShow: boolean,
    info: ConfirmTxInfo
  }
  export type State = {
    dialog: Dialog,
    confirmTxInfo: ConfirmTxInfoDialog,
  };

  export const initialState = (): State => ({
    dialog: {
      text: '',
      title: '',
      visible: false,
    },
    confirmTxInfo: {
      isShow: false,
      info: {
        msgId: '',
        unsignedTx: '',
        tx: {
          id: '',
          hash: '',
          userId: '',
          fullValue: '',
          action: TxAction.Transfer,
          address: '',
          currency: Currency.DOT,
          txType: TxType.Sent,
          timestamp: 0,

          value: 0,
          planckValue: '0',
          usdValue: 0,

          fee: 0,
          planckFee: '0',
          usdFee: 0,

          status: TxStatus.Success,
        },
        args: {
          unsignedTx: '',
          currency: '',
          success: '',
          error: '',
          arguments: '',
        },
        errorText: null,
        warningText: null,
        creator: {
          id: '',
          name: '',
          username: '',
          avatarExt: '',
          lastUpdate: 0,
          addresses: null,
          isChatBot: false,
        },
        accountCurrency: Currency.DOT,
      },
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
      showConfirmTxInfo(state: State, action: PayloadAction<ConfirmTxInfo>): State {
        state.confirmTxInfo = {
          isShow: true,
          info: action.payload,
        };
        return state;
      },
      hideConfirmTxInfo(state: State): State {
        state.confirmTxInfo.isShow = false;
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default DialogStore;
