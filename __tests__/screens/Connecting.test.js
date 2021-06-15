import React from 'react';
import {Connecting} from 'screens/Connecting';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';
import StringUtils from 'utils/string';
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test positive', () => {
  const tree = renderer.create(<Connecting navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click phone number', () => {
  const mockFn = jest.fn();
  const component = render(<Connecting navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText(StringUtils.texts.connecting.phone));
  expect(mockFn).toBeCalledWith('EditPhoneNumber');
});

it('Test click email', () => {
  const mockFn = jest.fn();
  const component = render(<Connecting navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText(StringUtils.texts.connecting.email));
  expect(mockFn).toBeCalledWith('EditEmail');
});
