import React from 'react';
import {Connecting} from 'screens/Connecting';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';

it('Test positive', () => {
  const tree = renderer.create(<Connecting navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click phone number', () => {
  const mockFn = jest.fn();
  const component = render(<Connecting navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText('Connect phone number'));
  expect(mockFn).toBeCalledWith('EditPhoneNumber');
});

it('Test click email', () => {
  const mockFn = jest.fn();
  const component = render(<Connecting navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText('Connect email'));
  expect(mockFn).toBeCalledWith('EditEmail');
});
