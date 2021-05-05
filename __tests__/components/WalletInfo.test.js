import React from 'react';
import renderer from 'react-test-renderer';
import {WalletInfo} from 'components/WalletInfo';
import {Currency, Wallet} from 'types/wallet';

it('Test Polkadot wallet', () => {
  const tree = renderer
    .create(
      <WalletInfo
        wallet={
          new Wallet(
            'Wallet Polkadot',
            'address#1',
            Currency.DOT,
            100,
            '1000000000000',
            10,
          )
        }
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test Kusama wallet', () => {
  const tree = renderer
    .create(
      <WalletInfo
        wallet={
          new Wallet(
            'Wallet Kusama',
            'address#2',
            Currency.KSM,
            20,
            '20000000000000',
            5,
          )
        }
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
