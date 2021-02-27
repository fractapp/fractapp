import React from 'react';
import renderer from 'react-test-renderer';
import {WalletLogo} from 'components/WalletLogo';
import {Currency, withoutBorder} from '../../src/types/wallet';

jest.mock('types/wallet', () => ({
  ...jest.requireActual('types/wallet'),
  withoutBorder: jest.fn(),
}));

it('Test with borders', () => {
  withoutBorder.mockImplementationOnce(() => false);
  const tree = renderer
    .create(<WalletLogo size={20} currency={Currency.Polkadot} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test without borders', () => {
  withoutBorder.mockImplementationOnce(() => true);
  const tree = renderer
    .create(<WalletLogo size={10} currency={Currency.Kusama} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
