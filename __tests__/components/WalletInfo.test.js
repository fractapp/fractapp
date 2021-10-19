import React from 'react';
import renderer from 'react-test-renderer';
import {WalletInfo} from 'components/WalletInfo';
import {Currency, Wallet} from 'types/wallet';
import StringUtils from 'utils/string';
import { AccountType, Network } from 'types/account';
import { WalletDetailsInfo } from 'components/WalletDetailsInfo';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test Polkadot wallet', () => {
  const tree = renderer
    .create(
      <WalletInfo
        account={{
          name: 'Wallet Polkadot',
          address: 'address#1',
          pubKey:  'pubkey#1',
          currency: Currency.DOT,
          network: Network.Polkadot,
          viewBalance: 100,
          balance: {
            total:  '1000000000000',
            transferable:  '1000000000000',
            payableForFee:  '1000000000000',
          },
          type: AccountType.Main,
        }}
        price={100}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
