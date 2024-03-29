import React from 'react';

import {SaveSeed} from 'screens/SaveSeed';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';
import Clipboard from '@react-native-community/clipboard';
import {showMessage} from 'react-native-flash-message';
import StringUtils from 'utils/string';
import {NativeModules} from 'react-native';

jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));
jest.mock('@react-native-community/clipboard', () => ({
  setString: jest.fn(),
}));
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
NativeModules.PreventScreenshotModule = {
  forbid: async () => {},
  allow: async () => {},
};
jest.useFakeTimers();

it('Test save seed #1', () => {
  const seed =
    'run knee code wall merge impact teach grain slim quality patient curve';
  const tree = renderer
    .create(
      <SaveSeed navigation={null} route={{params: {seed: seed.split(' ')}}} />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test save seed #1', () => {
  const seed =
    'staff select toddler junior robot own paper sniff glare drive stay census';
  const tree = renderer
    .create(
      <SaveSeed navigation={null} route={{params: {seed: seed.split(' ')}}} />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test save click copy', () => {
  const seed =
    'staff select toddler junior robot own paper sniff glare drive stay census';
  const component = render(
    <SaveSeed navigation={null} route={{params: {seed: seed.split(' ')}}} />,
  );
  fireEvent.press(component.getByText('Copy'));
  expect(Clipboard.setString).toBeCalledWith(seed);
  expect(showMessage).toBeCalledWith({
    message: 'show_msg.copied_to_clipboard',
    type: 'info',
    icon: 'info',
  });
});

it('Test save click next', () => {
  const mockFn = jest.fn();

  const seed =
    'staff select toddler junior robot own paper sniff glare drive stay census';
  const component = render(
    <SaveSeed
      navigation={{navigate: mockFn}}
      route={{params: {seed: seed.split(' ')}}}
    />,
  );

  fireEvent.press(component.getByText(StringUtils.texts.NextBtnTitle));
  expect(mockFn).toBeCalledWith('ConfirmSaveSeed', {seed: seed.split(' ')});
});
