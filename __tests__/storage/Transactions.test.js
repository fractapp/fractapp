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
      Currency.Polkadot,
      new Map([
        [
          'txIdOne',
          {
            id: 'txIdOne',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.Polkadot,
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
  const pendingTxs = new Map([[Currency.Polkadot, ['txOne', 'txTwo']]]);
  expect(Transactions.set(txs, pendingTxs)).toMatchSnapshot();
});
it('Test setTx', async () => {
  const tx = {
    id: 'txIdOne',
    userId: 'userId',
    address: 'address#1',
    currency: Currency.Kusama,
    txType: TxType.Received,
    timestamp: new Date('12-12-2020').getTime(),
    value: 10,
    usdValue: 10,
    fee: 10,
    usdFee: 10,
    status: TxStatus.Success,
  };
  expect(Transactions.setTx(Currency.Kusama, tx)).toMatchSnapshot();
});
it('Test addPendingTx', async () => {
  expect(
    Transactions.addPendingTx(Currency.Kusama, 'txHash'),
  ).toMatchSnapshot();
});
it('Test removePendingTx', async () => {
  expect(Transactions.removePendingTx(Currency.Kusama, 10)).toMatchSnapshot();
});

it('Test reducer set', async () => {
  const txs = new Map([
    [
      Currency.Polkadot,
      new Map([
        [
          'txIdOne',
          {
            id: 'txIdOne',
            userId: 'userId',
            address: 'address#1',
            currency: Currency.Polkadot,
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
  const pendingTxs = new Map([[Currency.Polkadot, ['txOne', 'txTwo']]]);
  expect(
    Transactions.reducer(initState(), Transactions.set(txs, pendingTxs)),
  ).toMatchSnapshot();
});
it('Test reducer setTx', async () => {
  const tx = {
    id: 'txIdOne',
    userId: 'userId',
    address: 'address#1',
    currency: Currency.Kusama,
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
      Transactions.addPendingTx(Currency.Kusama, 'txHash'),
    ),
  ).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.Kusama, ['txHash']);
});
it('Test reducer removePendingTx', async () => {
  let state = initState();
  state = Transactions.reducer(
    state,
    Transactions.addPendingTx(Currency.Kusama, 'txHashOne'),
  );
  expect(state).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.Kusama, ['txHashOne']);

  state = Transactions.reducer(
    state,
    Transactions.addPendingTx(Currency.Kusama, 'txHashTwo'),
  );
  expect(state).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.Kusama, [
    'txHashOne',
    'txHashTwo',
  ]);

  expect(
    Transactions.reducer(
      state,
      Transactions.removePendingTx(Currency.Kusama, 1),
    ),
  ).toMatchSnapshot();
  expect(DB.setPendingTxs).toBeCalledWith(Currency.Kusama, ['txHashOne']);
});

it('Test default', async () => {
  expect(
    Transactions.reducer(Transactions.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(initState());
});
