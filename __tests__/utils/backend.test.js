import backend from 'utils/fractappClient';
import DB from 'storage/DB';
import {FRACTAPP_API} from '@env';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'types/wallet';
import {Keyring} from '@polkadot/keyring';
import { AccountType, Network } from 'types/account';
import AccountsStore from 'storage/Accounts';

const mockDate = new Date(1466424490000);
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
global.fetch = jest.fn();
jest.mock('react-native-crypto', () => jest.fn());
jest.mock('storage/DB', () => ({
  getJWT: jest.fn(),
  setJWT: jest.fn(),
  getAccountStore: jest.fn(),
  getSeed: () =>
    'tomato fetch occur boost beach brand lawsuit frozen magic rookie equip source',
}));
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    get: jest.fn(),
  },
}));
jest.mock('@polkadot/keyring', () => ({
  Keyring: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test setToken', async () => {
  const token = 'token';

  DB.getJWT.mockReturnValueOnce('jwt');

  fetch.mockReturnValueOnce({
    status: 200,
  });

  const isOK = await backend.setToken(token);
  expect(DB.getJWT).toBeCalled();
  expect(fetch).toBeCalledWith(FRACTAPP_API + '/profile/firebase/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'BEARER ' + 'jwt',
    },
    body: JSON.stringify({
      token: token,
    }),
  });
  expect(isOK).toBe(true);
});

it('Test auth', async () => {
  const jwtToken = 'jwtToken';
  const sign = stringToU8a('sign');
  const authSign = stringToU8a('authSign');

  const accountsState = AccountsStore.initialState();
  accountsState.accounts[AccountType.Main] = {
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
  };

  const accountInfo = accountsState.accounts[AccountType.Main][Currency.DOT];
  DB.getAccountStore.mockReturnValueOnce(accountsState);
  fetch.mockReturnValueOnce({
    ok: true,
    status: 200,
    json: () => ({
      token: jwtToken,
    }),
  });

  const pubKey = stringToU8a('pubKey');
  const signMock = jest.fn();
  signMock.mockReturnValueOnce(sign);
  signMock.mockReturnValueOnce(authSign);
  Keyring.mockImplementation(() => ({
    addFromUri: jest.fn(() => ({
      sign: signMock,
      publicKey: pubKey,
    })),
  }));

  const value = 'value';
  const code = 'code';
  const codeType = backend.CodeType.Phone;
  const status = await backend.auth(codeType, value, code);
  const rq = {
    value: value,
    code: code,
    addresses: {
      0: {
        Address: accountInfo.address,
        PubKey: accountInfo.pubKey,
        Sign: u8aToHex(sign),
      },
    },
    type: codeType,
  };
  expect(fetch).toBeCalledWith(FRACTAPP_API + '/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Sign-Timestamp': String(mockDate.getTime() / 1000),
      Sign: u8aToHex(authSign),
      'Auth-Key': u8aToHex(pubKey),
    },
    body: JSON.stringify(rq),
  });
  expect(DB.setJWT).toBeCalledWith(jwtToken);
  expect(status).toBe(200);
  expect(signMock).toBeCalledWith(
    stringToU8a('It is my auth key for fractapp:0x7075624b65791466424490'),
  );
  expect(signMock).toBeCalledWith(
    stringToU8a(
      'It is my fractapp rq:' + JSON.stringify(rq) + mockDate.getTime() / 1000,
    ),
  );
});

it('Test getToken', async () => {
  DB.getJWT.mockReturnValueOnce('jwt');

  expect(await backend.getJWT()).toEqual('jwt');
});

it('Test sendCode', async () => {
  const rq = {
    type: backend.CodeType.Phone,
    value: 'value',
  };
  fetch.mockReturnValueOnce({
    ok: true,
    status: 200,
  });

  expect(await backend.sendCode(rq.value, rq.type)).toStrictEqual(200);
  expect(fetch).toBeCalledWith(FRACTAPP_API + '/auth/sendCode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rq),
  });
});



