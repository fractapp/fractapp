import React, {useState} from 'react';
import {mnemonicValidate} from '@polkadot/util-crypto';
import {ImportSeed} from 'screens/ImportSeed';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';
import {fireEvent, render} from '@testing-library/react-native';
import DB from 'storage/DB';
import StringUtils from 'utils/string';
import { NativeModules } from 'react-native';
import { useDispatch } from 'react-redux';
import tasks from 'utils/tasks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('react-native-crypto', () => {});
jest.mock('utils/tasks', () => ({
  createAccount: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicValidate: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
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

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test empty seed', () => {
  const tree = renderer
    .create(
        <ImportSeed />
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
        <ImportSeed />
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
        <ImportSeed />
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
        <ImportSeed />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test start save', async () => {
  const setSaveSeed = jest.fn();
  const seed =
    'run knee code wall merge impact teach grain slim quality patient curve';
  useState
    .mockImplementationOnce((init) => [seed, jest.fn()])
    .mockImplementationOnce((init) => [init, setSaveSeed]);

  mnemonicValidate.mockImplementation((seed) => true);
  const component = await render(
      <ImportSeed />
  );
  await fireEvent.press(component.getByText(StringUtils.texts.NextBtnTitle));
  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
  expect(setSaveSeed).toBeCalledWith(true);
});

it('Test save seed', async () => {
  const setSaveSeed = jest.fn();

  const seed =
    'run knee code wall merge impact teach grain slim quality patient curve';
  useState
    .mockImplementationOnce((init) => [seed, jest.fn()])
    .mockImplementationOnce((init) => [true, setSaveSeed]);

  await render(
      <ImportSeed />
  );

  expect(tasks.createAccount).toBeCalledWith(seed, dispatch);
  expect(dispatch).toBeCalledWith(GlobalStore.actions.hideLoading());
});
