import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {PassCode} from 'components/PassCode';
import StringUtils from 'utils/string';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);
jest.mock('storage/DB', () => ({
  getPasscode: jest.fn(()=>{ return [1,2]; }),
}));

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test one', () => {
  const tree = renderer
    .create(
      <PassCode
        isBiometry={false}
        description={'description'}
        onSubmit={() => console.log('asd')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <PassCode
        isBiometry={true}
        isBiometryStart={true}
        description={'description'}
        onSubmit={() => console.log('asd')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test three', () => {
  useState.mockImplementationOnce((init) => [[1, 2, 3, 4, 5], jest.fn()]);

  const tree = renderer
    .create(
      <PassCode
        isBiometry={false}
        description={'description'}
        onSubmit={() => console.log('asd')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test four', () => {
  const p = [1, 2, 3, 4, 5, 6];
  useState.mockImplementationOnce((init) => [p, jest.fn()]);

  const onSubmitMock = jest.fn((passcode) => {});
  const tree = renderer
    .create(
      <PassCode
        isBiometry={false}
        description={'description'}
        onSubmit={onSubmitMock}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test five', () => {
  const onSubmitMock = jest.fn((passcode) => {});
  const tree = render(
      <PassCode
        isBiometry={false}
        description={'description'}
        onSubmit={onSubmitMock}
      />,
    );
  fireEvent.press(tree.getByText('0'));
  expect(tree).toMatchSnapshot();
});
