import backend from 'utils/backend';
import DB from 'storage/DB';
import {FRACTAPP_API} from '@env';
import {stringToU8a, u8aToHex} from '@polkadot/util';
import {Currency} from 'types/wallet';
import {Keyring} from '@polkadot/keyring';

const mockDate = new Date(1466424490000);
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
global.fetch = jest.fn();
jest.mock('react-native-crypto', () => ({
  createCipher: jest.fn(),
  createDecipher: jest.fn(),
}));
jest.mock('storage/DB', () => ({
  getJWT: jest.fn(),
  setJWT: jest.fn(),
  getAccounts: jest.fn(),
  getSeed: () =>
    'tomato fetch occur boost beach brand lawsuit frozen magic rookie equip source',
  getAccountInfo: jest.fn(),
}));
jest.mock('@polkadot/keyring', () => ({
  Keyring: jest.fn(),
}));

it('Test setToken', async () => {
  const token = 'token';
  const account = 'account';
  const accountInfo = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    balance: 1000,
    planks: '10000000',
  };
  const sign = stringToU8a('sign');
  DB.getAccounts.mockReturnValueOnce([account]);
  DB.getAccountInfo.mockReturnValueOnce(accountInfo);
  fetch.mockReturnValueOnce({
    ok: true,
  });

  const signMock = jest.fn().mockReturnValueOnce(sign);
  Keyring.mockImplementation(() => ({
    addFromUri: jest.fn(() => ({
      sign: signMock,
    })),
  }));

  const isOK = await backend.setToken(token);
  expect(DB.getAccountInfo).toBeCalledWith(account);
  expect(fetch).toBeCalledWith(FRACTAPP_API + '/notification/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pubKey: accountInfo.pubKey,
      address: accountInfo.address,
      network: backend.Network.Polkadot,
      sign: u8aToHex(sign),
      token: token,
      timestamp: Math.round(mockDate.getTime() / 1000),
    }),
  });
  expect(isOK).toBe(true);
  expect(signMock).toBeCalledWith(
    stringToU8a('It is my firebase token for fractapp:token1466424490'),
  );
});

it('Test auth', async () => {
  const jwtToken = 'jwtToken';
  const account = 'account';
  const accountInfo = {
    name: 'name',
    address: 'address',
    pubKey: 'pubKey',
    currency: Currency.DOT,
    balance: 1000,
    planks: '10000000',
  };
  const sign = stringToU8a('sign');
  const authSign = stringToU8a('authSign');
  DB.getAccounts.mockReturnValueOnce([account]);
  DB.getAccountInfo.mockReturnValueOnce(accountInfo);
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
  const status = await backend.auth(value, code, codeType);
  expect(DB.getAccountInfo).toBeCalledWith(account);
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
  expect(fetch).toBeCalledWith(FRACTAPP_API + '/auth/signIn', {
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
