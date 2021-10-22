import AccountsStore from 'storage/Accounts';
import { AccountType, Network } from 'types/account';
import { Currency } from 'types/wallet';
import DB from 'storage/DB';

jest.mock('storage/DB', () => ({
  setAccountStore: jest.fn(),
}));

it('Test initialState', async () => {
  expect(AccountsStore.initialState).toMatchSnapshot();
});

it('Test set', async () => {
  const store = AccountsStore.initialState();
  store.accounts[AccountType.Main] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };

  expect(AccountsStore.reducer(AccountsStore.initialState(), AccountsStore.actions.set(store))).toStrictEqual(store);
});

it('Test updateBalance', async () => {
  const store = AccountsStore.initialState();
  store.accounts[AccountType.Main] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };

  const newStore = AccountsStore.reducer(store, AccountsStore.actions.updateBalance({
    currency: Currency.DOT,
    viewBalance: 1000,
    balance: {
      total: '500000000',
      transferable: '500000000',
      payableForFee: '500000000',
    },
  }));
  expect(newStore).toMatchSnapshot();
  expect(DB.setAccountStore).toBeCalled();
});


it('Test updateBalance (negative)', async () => {
  const store = AccountsStore.initialState();
  store.accounts[AccountType.Main] = {};
  const newStore = AccountsStore.reducer(store, AccountsStore.actions.updateBalance({
    currency: Currency.DOT,
    viewBalance: 1000,
    balance: {
      total: '500000000',
      transferable: '500000000',
      payableForFee: '500000000',
    },
  }));
  expect(newStore).toStrictEqual(store);
});


it('Test updateBalanceSubAccount (new)', async () => {
  const store = AccountsStore.initialState();
  store.accounts[AccountType.Main] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };

  const newStore = AccountsStore.reducer(store, AccountsStore.actions.updateBalanceSubAccount({
    currency: Currency.DOT,
    viewBalance: 1000,
    accountType: AccountType.Staking,
    balance: {
      total: '500000000',
      transferable: '500000000',
      payableForFee: '500000000',
    },
  }));
  expect(newStore).toMatchSnapshot();
  expect(DB.setAccountStore).toBeCalled();
});


it('Test updateBalanceSubAccount (exist)', async () => {
  const store = AccountsStore.initialState();
  store.accounts[AccountType.Staking] = {
    0: {
      name: 'Polkadot wallet',
      address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
      pubKey: '0x0000000000000000000',
      currency: Currency.DOT,
      network: Network.Polkadot,
      viewBalance: 123,
      balance: {
        total: '100000',
        transferable: '100000',
        payableForFee: '100000',
      },
      type: AccountType.Main,
    },
    1: {
      name: 'Kusama wallet',
      address: 'kusamaAddress',
      pubKey: '0x00000000000000000001123',
      currency: Currency.KSM,
      network: Network.Kusama,
      viewBalance: 321,
      balance: {
        total: '200000',
        transferable: '200000',
        payableForFee: '200000',
      },
      type: AccountType.Main,
    },
  };

  const newStore = AccountsStore.reducer(store, AccountsStore.actions.updateBalanceSubAccount({
    currency: Currency.DOT,
    accountType: AccountType.Staking,
    viewBalance: 1000,
    balance: {
      total: '500000000',
      transferable: '500000000',
      payableForFee: '500000000',
    },
  }));
  expect(newStore).toMatchSnapshot();
  expect(DB.setAccountStore).toBeCalled();
});
