import React, {useState, useContext} from 'react';
import renderer from 'react-test-renderer';
import {Search} from 'screens/Search';
import GlobalStore from 'storage/Global';
import DialogStore from 'storage/Dialog';
import {render} from '@testing-library/react-native';
import backend from 'utils/backend';
import {PermissionsAndroid} from 'react-native';
import Dialog from 'storage/Dialog';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
}));
jest.mock('storage/DB', () => ({}));
jest.mock('storage/Dialog', () => ({
  close: jest.fn(),
  open: jest.fn(),
}));
jest.mock('utils/backend', () => ({
  myMatchContacts: jest.fn(() => {
    const contacts = [
      {
        phoneNumbers: {
          label: 'label1',
          number: '+79816545588',
        },
      },
      {
        phoneNumbers: {
          label: 'label2',
          number: '+79816545222',
        },
      },
    ];
    return contacts;
  }),
  myContacts: jest.fn(() => {
    const contacts = ['0', '1'];
    return contacts;
  }),
  getImgUrl: jest.fn(() => 'uri'),
}));
jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(() => {
    const contacts = [
      {
        id: '0',
      },
      {
        id: '1',
      },
    ];
    return contacts;
  }),
}));



useState.mockImplementation((init) => [init, jest.fn()]);

it('Test view (empty)', () => {
  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<Search navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test view', () => {
  const users = [];
  for (let i = 0; i < 5; i++) {
    users.push({
      id: 'id' + i,
      name: 'name' + i,
      username: 'username' + i,
      avatarExt: i % 5 === 0 ? 'png' : '',
      lastUpdate: 123123,
      addresses: {
        0: 'addressDOT' + i,
        1: 'addressKSM' + i,
      },
    });
  }

  useState
    .mockImplementationOnce((init) => [init, jest.fn()])
    .mockImplementationOnce((init) => [users, jest.fn()]);

  useContext.mockReturnValueOnce({
    state: GlobalStore.initialState(),
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<Search navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test getMyMatchContacts', () => {
  const globalContext = {
    profile: {
      id: 'id',
      name: 'name',
      username: 'username',
      phoneNumber: 'phoneNumber',
      email: 'email',
      isMigratory: 'isMigratory',
      avatarExt: 'avatarExt',
      lastUpdate: 1,
    },
    isRegistered: true,
    setUser: jest.fn(),
    setContacts: jest.fn(),
  };
  useContext.mockReturnValueOnce({
    state: globalContext,
    dispatch: jest.fn(),
  });

  const tree = renderer
    .create(<Search navigation={null} route={{params: {}}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
