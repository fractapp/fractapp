import React, {useState} from 'react';

import {mnemonicValidate} from '@polkadot/util-crypto';
import {ImportSeed} from 'screens/ImportSeed';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { NativeModules } from 'react-native';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('react-native-crypto', () => {});
jest.mock('storage/DB', () => ({
  createAccounts: jest.fn(),
}));

jest.mock('@polkadot/util-crypto', () => ({
  mnemonicValidate: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
NativeModules.PreventScreenshotModule = {
  forbid: async () => {},
  allow: async () => {},
};
jest.useFakeTimers();

useState.mockImplementation((init) => [init, jest.fn()]);

it('Test empty seed', () => {
  const tree = renderer
    .create(
      <GlobalStore.Context.Provider value={{}}>
        <ImportSeed />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test invalid seed', () => {
  useState.mockImplementationOnce((init) => [
    'run knee code wall merge impact teach grain slim quality patient curve123123',
    jest.fn(),
  ]);

  mnemonicValidate.mockImplementation((seed) => false);

  const tree = renderer
    .create(
      <GlobalStore.Context.Provider value={{}}>
        <ImportSeed />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test valid seed', () => {
  useState.mockImplementationOnce((init) => [
    'run knee code wall merge impact teach grain slim quality patient curve',
    jest.fn(),
  ]);

  mnemonicValidate.mockImplementation((seed) => true);

  const tree = renderer
    .create(
      <GlobalStore.Context.Provider value={{}}>
        <ImportSeed />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
  useState
    .mockImplementationOnce((init) => [
      'run knee code wall merge impact teach grain slim quality patient curve',
      jest.fn(),
    ])
    .mockImplementationOnce((init) => [true, jest.fn()]);

  mnemonicValidate.mockImplementation((seed) => true);

  const tree = renderer
    .create(
      <GlobalStore.Context.Provider value={{}}>
        <ImportSeed />
      </GlobalStore.Context.Provider>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test start save', async () => {
  const setLoading = jest.fn();
  const setSaveSeed = jest.fn();
  const seed =
    'run knee code wall merge impact teach grain slim quality patient curve';
  useState
    .mockImplementationOnce((init) => [seed, jest.fn()])
    .mockImplementationOnce((init) => [init, setLoading])
    .mockImplementationOnce((init) => [init, setSaveSeed]);

  mnemonicValidate.mockImplementation((seed) => true);
  const component = await render(
    <GlobalStore.Context.Provider value={{}}>
      <ImportSeed />
    </GlobalStore.Context.Provider>,
  );
  await fireEvent.press(component.getByText(StringUtils.texts.NextBtnTitle));
  expect(setLoading).toBeCalledWith(true);
  expect(setSaveSeed).toBeCalledWith(true);
});

it('Test save seed', async () => {
  const setLoading = jest.fn();
  const setSaveSeed = jest.fn();
  const dispatch = jest.fn();

  const seed =
    'run knee code wall merge impact teach grain slim quality patient curve';
  useState
    .mockImplementationOnce((init) => [seed, jest.fn()])
    .mockImplementationOnce((init) => [true, setLoading])
    .mockImplementationOnce((init) => [true, setSaveSeed]);

  const component = await render(
    <GlobalStore.Context.Provider
      value={{
        dispatch: dispatch,
      }}>
      <ImportSeed />
    </GlobalStore.Context.Provider>,
  );

  expect(DB.createAccounts).toBeCalledWith(seed);
  expect(dispatch).toBeCalledWith(GlobalStore.signInLocal());
  expect(setLoading).toBeCalledWith(false);
});
