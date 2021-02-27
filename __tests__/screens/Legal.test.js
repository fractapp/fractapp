import React, {useState} from 'react';
import {Legal} from 'screens/Legal';
import renderer from 'react-test-renderer';
import {fireEvent, render} from '@testing-library/react-native';
import {SaveSeed} from 'screens/SaveSeed';
import {Currency} from 'types/wallet';
import {Linking} from 'react-native';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test checkbox=false', () => {
  const tree = renderer.create(<Legal navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test checkbox=true', () => {
  useState.mockImplementationOnce(() => [true, jest.fn()]);
  const tree = renderer.create(<Legal navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click T&C', () => {
  const component = render(<Legal navigation={null} />);

  fireEvent.press(component.getByText('Terms & Conditions'));
  expect(Linking.openURL).toBeCalledWith(
    'http://fractapp.com/legal/app-tos.html',
  );
});

it('Test click Privacy Policy', () => {
  const component = render(<Legal navigation={null} />);

  fireEvent.press(component.getByText('Privacy Policy'));
  expect(Linking.openURL).toBeCalledWith(
    'http://fractapp.com/legal/app-privacy-policy.html',
  );
});

it('Test click next', () => {
  useState.mockImplementationOnce(() => [true, jest.fn()]);
  const mockNav = jest.fn();
  const component = render(<Legal navigation={{navigate: mockNav}} />);

  fireEvent.press(component.getByText('Next'));
  expect(mockNav).toBeCalledWith('SettingWallet');
});
