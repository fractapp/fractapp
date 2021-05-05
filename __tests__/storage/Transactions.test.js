import {Currency} from 'types/wallet';
import DB from 'storage/DB';
import Transactions from 'storage/Transactions';
import {TxStatus, TxType} from 'types/transaction';

jest.mock('storage/DB', () => ({
  setPendingTxs: jest.fn(),
  setTx: jest.fn(),
}));

const initState = () => ({
  transactions: new Map(),
  pendingTransactions: new Map(),
  isInitialized: false,
});

it('Test set', async () => {
  const txs = new Map([
    [
      Currency.DOT,
      new Map([
        [
          'txIdOne',
          {
            id: 'txIdOne',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.DOT,
            txType: TxType.None,
            timestamp: new Date('12-12-2020').getTime(),
            value: 10,
            usdValue: 10,
            fee: 10,
            usdFee: 10,
            status: TxStatus.Success,
          },
        ],
      ]),
    ],
  ]);
  const pendingTxs = new Map([[Currency.DOT, ['txOne', 'txTwo']]]);
  expect(Transactions.set(txs, pendingTxs)).toMatchSnapshot();
});
it('Test setTx', async () => {
  const tx = {
    id: 'txIdOne',
    userId: 'userId',
    address: 'address#1',
    currency: Currency.KSM,
    txType: TxType.Received,
    timestamp: new Date('12-12-2020').getTime(),
    value: 10,
    usdValue: 10,
    fee: 10,
    usdFee: 10,
    status: TxStatus.Success,
  };
  expect(Transactions.setTx(Currency.KSM, tx)).toMatchSnapshot();
});
it('Test addPendingTx', async () => {
  expect(Transactions.addPendingTx(Currency.KSM, 'txHash')).toMatchSnapshot();
});
it('Test removePendingTx', async () => {
  expect(Transactions.removePendingTx(Currency.KSM, 10)).toMatchSnapshot();
});

it('Test reducer set', async () => {
  const txs = new Map([
    [
      Currency.DOT,
      new Map([
        [
          'txIdOne',
          {
            id: 'txIdOne',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.DOT,
            txType: TxType.None,
            timestamp: new Date('12-12-2020').getTime(),
            value: 10,
            usdValue: 10,
            fee: 10,
            usdFee: 10,
            status: TxStatus.Success,
          },
        ],
      ]),
    ],
  ]);
  const pendingTxs = new Map([[Currency.DOT, ['txOne', 'txTwo']]]);
  expect(
    Transactions.reducer(initState(), Transactions.set(txs, pendingTxs)),
  ).toMatchSnapshot();
});
it('Test reducer setTx', async () => {
  const tx = {
    id: 'txIdOne',
    userId: 'userId',
    address: 'address#1',
    currency: Currency.KSM,
    txType: TxType.Received,
    timestamp: new Date('12-12-2020').getTime(),
    value: 10,
    usdValue: 10,
    fee: 10,
    usdFee: 10,
    status: TxStatus.Success,
  };
  expect(
    Transactions.reducer(initState(), Transactions.setTx(tx.currency, tx)),
  ).toMatchSnapshot();
  expect(DB.setTx).toBeCalledWith(tx.currency, tx);
});
it('Test reducer addPendingTx', async () => {
  expect(
    Transactions.reducer(
      initState(),
      Transactions.addPendingTx(Currency.KSM, 'txHash'),
    ),
  ).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.KSM, ['txHash']);
});
it('Test reducer removePendingTx', async () => {
  let state = initState();
  state = Transactions.reducer(
    state,
    Transactions.addPendingTx(Currency.KSM, 'txHashOne'),
  );
  expect(state).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.KSM, ['txHashOne']);

  state = Transactions.reducer(
    state,
    Transactions.addPendingTx(Currency.KSM, 'txHashTwo'),
  );
  expect(state).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.KSM, [
    'txHashOne',
    'txHashTwo',
  ]);

  expect(
    Transactions.reducer(state, Transactions.removePendingTx(Currency.KSM, 1)),
  ).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.KSM, ['txHashOne']);
});

it('Test default', async () => {
  expect(
    Transactions.reducer(Transactions.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
