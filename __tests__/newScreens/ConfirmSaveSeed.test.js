import React, {useState} from 'react';
import {ConfirmSaveSeed} from 'screens/ConfirmSaveSeed';
import renderer from 'react-test-renderer';
import GlobalStore from 'storage/Global';
import { render } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import Store from 'storage/Store';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
jest.mock('react-native-crypto', () => {});
jest.mock('adaptors/adaptor', () => {});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));
jest.mock('utils/tasks', () => ({
  createAccount: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

const seed =
  'run knee code wall merge impact teach grain slim quality patient curve'.split(
    ' ',
  );

it('Test confirm seed start', async () => {
  let store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  useState
    .mockImplementationOnce((init) => [[], jest.fn()])
    .mockImplementationOnce((init) => [seed, jest.fn()]);

  const tree = renderer
    .create(
        <ConfirmSaveSeed
          route={{
            params: {
              seed: seed,
            },
          }}
        />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test confirm seed incorrectly', async () => {
  let store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  let selectedSeed = [...seed];
  selectedSeed.splice(3, 1);
  selectedSeed.push(seed[3]);

  useState
    .mockImplementationOnce((init) => [selectedSeed, jest.fn()])
    .mockImplementationOnce((init) => [[], jest.fn()]);

  const tree = renderer
    .create(
        <ConfirmSaveSeed
          route={{
            params: {
              seed: seed,
            },
          }}
        />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test confirm seed success', async () => {
  let store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  useState
    .mockImplementationOnce((init) => [seed, jest.fn()])
    .mockImplementationOnce((init) => [[], jest.fn()]);

  const tree = renderer
    .create(
        <ConfirmSaveSeed
          route={{
            params: {
              seed: seed,
            },
          }}
        />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view', async () => {
  let store = Store.initValues();
  useSelector.mockImplementation((fn) => {
    return fn(store);
  });

  useState
  .mockImplementationOnce((init) => [seed, jest.fn()])
  .mockImplementationOnce((init) => [[], jest.fn()])
  .mockImplementationOnce((init) => [[], jest.fn()]);

  const tree = render(
      <ConfirmSaveSeed
        route={{
          params: {
            seed: seed,
          },
        }}
      />
  );
  expect(tree).toMatchSnapshot();
});
