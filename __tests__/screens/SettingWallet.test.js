import React from 'react';

import {SettingWallet} from 'screens/SettingWallet';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';
import StringUtils from 'utils/string';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test positive', () => {
  const tree = renderer
    .create(
      <SettingWallet navigation={null} route={{params: {seed: 'seed seed'}}} />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click create new wallet', () => {
  const mockFn = jest.fn();
  const component = render(
    <SettingWallet
      navigation={{navigate: mockFn}}
      route={{params: {seed: 'seed seed'}}}
    />,
  );
  fireEvent.press(component.getByText(StringUtils.texts.settingWallet.create));
  expect(mockFn).toBeCalledWith('SaveWallet', {seed: 'seed seed'});
});

it('Test click I have a wallet', () => {
  const mockFn = jest.fn();
  const component = render(
    <SettingWallet
      navigation={{navigate: mockFn}}
      route={{params: {seed: 'seed seed'}}}
    />,
  );
  fireEvent.press(component.getByText(StringUtils.texts.settingWallet.import));
  expect(mockFn).toBeCalledWith('ImportWallet');
});
