import React from 'react';
import renderer from 'react-test-renderer';
import {WalletDetailsInfo} from 'components/WalletDetailsInfo';
import {Currency, Wallet} from 'types/wallet';
import { AccountBalance, AccountType, Network } from 'types/account';

it('Test Polkadot wallet', () => {
  const tree = renderer
    .create(
      <WalletDetailsInfo
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

