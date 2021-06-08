import React, {useState} from 'react';
import {Legal} from 'screens/Legal';
import renderer from 'react-test-renderer';
import {fireEvent, render} from '@testing-library/react-native';
import {Linking} from 'react-native';
import StringUtils from 'utils/string';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));

jest.mock('react-native', () => {});

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

  fireEvent.press(component.getByText(StringUtils.texts.legal.tos));
  expect(Linking.openURL).toBeCalledWith(
    'http://fractapp.com/legal/app-tos.html',
  );
});

it('Test click Privacy Policy', () => {
  const component = render(<Legal navigation={null} />);

  fireEvent.press(component.getByText(StringUtils.texts.legal.privacyPolicy));
  expect(Linking.openURL).toBeCalledWith(
    'http://fractapp.com/legal/app-privacy-policy.html',
  );
});

it('Test click next', () => {
  useState.mockImplementationOnce(() => [true, jest.fn()]);
  const mockNav = jest.fn();
  const component = render(<Legal navigation={{navigate: mockNav}} />);

  fireEvent.press(component.getByText(StringUtils.texts.NextBtnTitle));
  expect(mockNav).toBeCalledWith('SettingWallet');
});

it('Test click checkbox', () => {
  let toggleCheckBox = false;
  const setToggleCheckBox = jest.fn((v) => (toggleCheckBox = v));

  useState.mockImplementationOnce(() => [toggleCheckBox, setToggleCheckBox]);
  const mockNav = jest.fn();
  const component = render(<Legal navigation={{navigate: mockNav}} />);

  fireEvent.press(
    component.getByText(
      'I have read, understood, and agree with the Terms & Conditions and Privacy Policy',
    ),
  );
  expect(setToggleCheckBox).toBeCalledWith(true);
});
