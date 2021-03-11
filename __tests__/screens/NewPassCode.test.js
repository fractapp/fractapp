import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {NewPassCode} from 'screens/NewPassCode';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import {showMessage} from 'react-native-flash-message';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('components/PassCode', () => ({
  PassCode: ({isBiometry, description, onSubmit}) => {
    const r = require('react-native');
    return (
      <r.View>
        <r.TouchableHighlight
          testID={'btnSubmit'}
          onPress={() => onSubmit([1, 1, 1, 1, 1, 1])}>
          <r.Text>mock</r.Text>
        </r.TouchableHighlight>
      </r.View>
    );
  },
}));
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view', () => {
  const tree = renderer.create(<NewPassCode navigation={null} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test confirm new passcode', async () => {
  const dispatch = jest.fn();
  const goBack = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });

  const setNewPasscode = jest.fn();
  const setDescription = jest.fn();
  useState
    .mockImplementationOnce((init) => [init, setNewPasscode])
    .mockImplementationOnce((init) => [init, setDescription]);

  const component = render(<NewPassCode navigation={{goBack: goBack}} />);

  await fireEvent.press(component.getByTestId('btnSubmit'));

  expect(setNewPasscode).toBeCalledWith([1, 1, 1, 1, 1, 1]);
  expect(setDescription).toBeCalledWith('Confirm new passcode');
});

it('Test success passcode', async () => {
  const dispatch = jest.fn();
  const goBack = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });

  const setNewPasscode = jest.fn();
  const setDescription = jest.fn();
  useState
    .mockImplementationOnce((init) => [[1, 1, 1, 1, 1, 1], setNewPasscode])
    .mockImplementationOnce((init) => [init, setDescription]);

  const component = render(<NewPassCode navigation={{goBack: goBack}} />);

  await fireEvent.press(component.getByTestId('btnSubmit'));

  expect(dispatch).toBeCalledWith(GlobalStore.enablePasscode('111111'));
  expect(goBack).toBeCalled();
});

it('Test invalid passcode', async () => {
  const dispatch = jest.fn();
  const goBack = jest.fn();
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: dispatch,
  });

  const setNewPasscode = jest.fn();
  const setDescription = jest.fn();
  useState
    .mockImplementationOnce((init) => [[1, 1, 1, 1, 1, 2], setNewPasscode])
    .mockImplementationOnce((init) => [init, setDescription]);

  const component = render(<NewPassCode navigation={{goBack: goBack}} />);

  await fireEvent.press(component.getByTestId('btnSubmit'));

  expect(showMessage.mock.calls[0][0]).toMatchSnapshot();
});
