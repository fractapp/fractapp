import SecureStorage from 'react-native-sensitive-info';
import {Keyring} from '@polkadot/api';
import {hexToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'models/wallet';
import db from 'storage/DB';
import {Account} from 'models/account';

jest.mock('react-native-sensitive-info', () => ({
  setItem: jest.fn(),
}));
const mockAddFromUri = jest.fn();
jest.mock('@polkadot/api', () => ({
  Keyring: () => ({
    addFromUri: mockAddFromUri,
  }),
}));

it('Test creact accounts', async () => {
  const polkadotAddress = 'polkadotAddress';
  const kusamatAddress = 'kusamaAddress';

  const polkadotPubKey = '0x000000000001';
  const kusamaPubKey = '0x000000000002';

  const polkadot = new Account(
    'Polkadot wallet',
    polkadotAddress,
    polkadotPubKey,
    Currency.Polkadot,
    0,
  );
  const kusama = new Account(
    'Kusama wallet',
    kusamatAddress,
    kusamaPubKey,
    Currency.Kusama,
    0,
  );

  new Keyring().addFromUri
    .mockReturnValueOnce({
      address: polkadotAddress,
      publicKey: hexToU8a(polkadotPubKey),
    })
    .mockReturnValueOnce({
      address: kusamatAddress,
      publicKey: hexToU8a(kusamaPubKey),
    });

  const seed = 'seed';
  await db.createAccounts(seed);

  expect(SecureStorage.setItem).toBeCalledWith(
    `account_${polkadotAddress}`,
    JSON.stringify(polkadot),
    db.currentAccountsStore,
  );
  expect(SecureStorage.setItem).toBeCalledWith(
    `account_${kusamatAddress}`,
    JSON.stringify(kusama),
    db.currentAccountsStore,
  );
  expect(SecureStorage.setItem).toBeCalledWith(
    'accounts',
    JSON.stringify([polkadotAddress, kusamatAddress]),
    db.currentAccountsStore,
  );
  expect(SecureStorage.setItem).toBeCalledWith(
    'seed',
    seed,
    db.currentAccountsStore,
  );
});
