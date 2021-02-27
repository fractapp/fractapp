import React, {useState} from 'react';
import {render} from '@testing-library/react-native';
import {GoogleDrivePicker} from 'screens/GoogleDrivePicker';
import {DriveItem, Type} from 'types/google';
import googleUtil from 'utils/google';

jest.mock('utils/polkadot', () => {});
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

useState.mockImplementation((init) => [init, jest.fn()]);
jest.mock('utils/google', () => ({
  getItems: jest.fn(),
  getFileBackup: jest.fn(),
}));

it('Test root dir', async () => {
  const items = [
    {
      id: 'dir#1',
      title: 'dir#1',
      type: Type.Dir,
    },
    {
      id: 'dir#2',
      title: 'dir#2',
      type: Type.Dir,
    },
    {
      id: 'json#3',
      title: 'json#3',
      type: Type.Json,
    },
    {
      id: 'json#4',
      title: 'json#4',
      type: Type.Json,
    },
  ];
  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [items, jest.fn()])
    .mockImplementationOnce((init) => [false, jest.fn()]);

  const tree = render(<GoogleDrivePicker navigation={null} />).toJSON();

  expect(tree).toMatchSnapshot();
});

it('Test deep dir', async () => {
  const items = [
    {
      id: 'dir#1',
      title: 'dir#1',
      type: Type.Dir,
    },
    {
      id: 'json#1',
      title: 'json#1',
      type: Type.Json,
    },
    {
      id: 'json#2',
      title: 'json#2',
      type: Type.Json,
    },
  ];
  useState
    .mockImplementationOnce((init) => [['root', 'dir#1'], jest.fn()])
    .mockImplementationOnce((init) => [items, jest.fn()])
    .mockImplementationOnce((init) => [false, jest.fn()]);

  const tree = render(<GoogleDrivePicker navigation={null} />).toJSON();

  expect(tree).toMatchSnapshot();
});

it('Test update $1', async () => {
  render(<GoogleDrivePicker navigation={null} />);

  expect(googleUtil.getItems).toHaveBeenCalledWith('root');
});

it('Test update #2', async () => {
  useState.mockImplementationOnce((init) => [['root', 'dir#1'], jest.fn()]);

  render(<GoogleDrivePicker navigation={null} />);

  expect(googleUtil.getItems).toHaveBeenCalledWith('dir#1');
});

it('Test loader', async () => {
  const tree = render(<GoogleDrivePicker navigation={null} />);

  expect(tree).toMatchSnapshot();
});
