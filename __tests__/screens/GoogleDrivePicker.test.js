import React, {useState} from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {GoogleDrivePicker} from 'screens/GoogleDrivePicker';
import {DriveItem, Type} from 'types/google';
import googleUtil from 'utils/google';

jest.mock('adaptors/adaptor', () => {});
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

it('Test click open', async () => {
  const setPaths = jest.fn();
  const setItems = jest.fn();
  const setLoading = jest.fn();
  const items = [
    {
      id: 'back',
      title: 'back',
      type: Type.Dir,
    },
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
    .mockImplementationOnce((init) => [['root', 'dir#0'], setPaths])
    .mockImplementationOnce((init) => [items, setItems])
    .mockImplementationOnce((init) => [false, setLoading]);

  const navigate = jest.fn();

  const file = {
    seed: 'seed',
    algorithm: 'algorithm',
  };
  googleUtil.getFileBackup.mockReturnValueOnce(file);
  const component = render(
    <GoogleDrivePicker navigation={{navigate: navigate}} />,
  );
  const ids = component.getAllByTestId('driveItemBtn');

  await fireEvent.press(ids[1]);
  expect(setPaths).toBeCalledWith(['root', 'dir#0', 'dir#1']);
  expect(setLoading).toBeCalledWith(true);

  await fireEvent.press(ids[2]);
  expect(googleUtil.getFileBackup).toBeCalledWith('json#1');
  expect(navigate).toBeCalledWith('WalletFileImport', {file: file});

  await fireEvent.press(ids[0]);
  expect(setPaths).toBeCalledWith(['root']);
  expect(setLoading).toBeCalledWith(true);
});
