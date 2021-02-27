import React from 'react';
import {Start} from 'screens/Start';
import renderer from 'react-test-renderer';
import {render, fireEvent} from '@testing-library/react-native';

it('Test positive', () => {
  const tree = renderer.create(<Start navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click start', () => {
  const mockFn = jest.fn();
  const component = render(<Start navigation={{navigate: mockFn}} />);
  fireEvent.press(component.getByText('Start'));
  expect(mockFn).toBeCalledWith('Legal');
});
