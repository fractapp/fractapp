import React from 'react';

import {SettingWallet} from 'screens/SettingWallet';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';

it('Test positive', () => {
  const tree = renderer.create(<SettingWallet navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click create new wallet', () => {
  const mockFn = jest.fn();
  const component = render(<SettingWallet navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText('Create new wallet'));
  expect(mockFn).toBeCalledWith('SaveWallet');
});

it('Test click I have a wallet', () => {
  const mockFn = jest.fn();
  const component = render(<SettingWallet navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText('I have a wallet'));
  expect(mockFn).toBeCalledWith('ImportWallet');
});
