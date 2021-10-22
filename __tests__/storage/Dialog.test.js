import DialogStore from 'storage/Dialog';
import { Transaction } from 'types/transaction';
import { BroadcastArgs } from 'types/message';
import { Profile } from 'types/profile';
import { Currency } from 'types/wallet';
import { ConfirmTxInfo } from 'types/inputs';


it('Test initialState', async () => {
  expect(DialogStore.initialState).toMatchSnapshot();
});


it('Test actions', async () => {
  let store = DialogStore.initialState();

  store = DialogStore.reducer(store, DialogStore.actions.showDialog({
    title: 'title',
    text: 'text',
  }));
  expect(store.dialog).toStrictEqual({
    title: 'title',
    text: 'text',
    visible: true,
  });

  store = DialogStore.reducer(store, DialogStore.actions.hideDialog());
  expect(store.dialog).toStrictEqual({
    title: 'title',
    text: 'text',
    visible: false,
  });

  const p = {
    msgId: 'msgId',
    unsignedTx: 'unsignedTx',
    tx: {
      id: 'tx',
    },
    args: {
      unsignedTx: 'unsignedTx',
      currency: 'currency',
      success: 'success',
      error: 'error',
      arguments: 'arguments',
    },
    creator: {
      id: 'myProfile',
      name: 'name',
      username: 'username',
      phoneNumber: 'phoneNumber',
      email: 'email',
      avatarExt: 'png',
      lastUpdate: 100,
    },
    accountCurrency: Currency.DOT,
    warningText: null,
    errorText: null,
  };
  store = DialogStore.reducer(store, DialogStore.actions.showConfirmTxInfo(p));
  expect(store.confirmTxInfo).toStrictEqual({
    isShow: true,
    info: p,
  });

  store = DialogStore.reducer(store, DialogStore.actions.hideConfirmTxInfo());
  expect(store.confirmTxInfo.isShow).toEqual(false);
});
