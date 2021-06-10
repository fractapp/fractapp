import React from 'react';
import renderer from 'react-test-renderer';
import {WalletLogo} from 'components/WalletLogo';
import {Currency, withoutBorder} from 'types/wallet';
import StringUtils from 'utils/string';

jest.mock('types/wallet', () => ({
  ...jest.requireActual('types/wallet'),
  withoutBorder: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test with borders', () => {
  withoutBorder.mockImplementationOnce(() => false);
  const tree = renderer
    .create(<WalletLogo size={20} currency={Currency.DOT} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test without borders', () => {
  withoutBorder.mockImplementationOnce(() => true);
  const tree = renderer
    .create(<WalletLogo size={10} currency={Currency.KSM} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
