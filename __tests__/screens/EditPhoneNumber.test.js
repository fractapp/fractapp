import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EditPhoneNumber} from 'screens/EditPhoneNumber';
import FractappClient from 'utils/fractappClient';
import {fireEvent, render} from '@testing-library/react-native';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('utils/fractappClient', () => ({
  getLocalByIp: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test view with empty number', async () => {
  useState.mockImplementation((init) => [init, jest.fn()]);

  FractappClient.getLocalByIp.mockReturnValueOnce('AD');
  const tree = renderer
    .create(
      <EditPhoneNumber
        navigation={{setOptions: jest.fn()}}
        route={{
          params: {},
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test useEffect with empty number', async () => {
  const setCountryCode = jest.fn();
  const setNumber = jest.fn();
  const setCountryCodeLength = jest.fn();
  const setCountryName = jest.fn();

  useState.mockImplementationOnce((init) => [init, setCountryCode]);
  useState.mockImplementationOnce((init) => [init, setNumber]);
  useState.mockImplementationOnce((init) => [init, setCountryCodeLength]);
  useState.mockImplementationOnce((init) => [init, setCountryName]);

  FractappClient.getLocalByIp.mockReturnValueOnce('AD');
  await render(
    <EditPhoneNumber
      navigation={{ setOptions: jest.fn() }}
      route={{
        params: {},
      }}
    />,
  );

  expect(setCountryCodeLength).toBeCalledWith(3);
  expect(setCountryCode).toBeCalledWith('AD');
  expect(setCountryName).toBeCalledWith('Andorra');
  expect(setNumber).toBeCalledWith('376');
});

it('Test useEffect with selectedCountryCode', async () => {
  const setCountryCode = jest.fn();
  const setNumber = jest.fn();
  const setCountryCodeLength = jest.fn();
  const setCountryName = jest.fn();

  useState.mockImplementationOnce((init) => [init, setCountryCode]);
  useState.mockImplementationOnce((init) => [init, setNumber]);
  useState.mockImplementationOnce((init) => [init, setCountryCodeLength]);
  useState.mockImplementationOnce((init) => [init, setCountryName]);

  FractappClient.getLocalByIp.mockReturnValueOnce('AG');
  const component = await render(
    <EditPhoneNumber
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {selectedCountryCode: 'AR'},
      }}
    />,
  );

  expect(setCountryCodeLength).toBeCalledWith(2);
  expect(setCountryCode).toBeCalledWith('AR');
  expect(setCountryName).toBeCalledWith('Argentina');
  expect(setNumber).toBeCalledWith('54');
});

it('Test useEffect with number', async () => {
  const setCountryCode = jest.fn();
  const setNumber = jest.fn();
  const setCountryCodeLength = jest.fn();
  const setCountryName = jest.fn();

  useState.mockImplementationOnce((init) => ['', setCountryCode]);
  useState.mockImplementationOnce((init) => ['13192000228', setNumber]);
  useState.mockImplementationOnce((init) => [init, setCountryCodeLength]);
  useState.mockImplementationOnce((init) => [init, setCountryName]);

  FractappClient.getLocalByIp.mockReturnValueOnce('');
  const component = await render(
    <EditPhoneNumber
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {},
      }}
    />,
  );

  expect(setCountryCode).toBeCalledWith('US');
  expect(setCountryName).toBeCalledWith('United States');
});

it('Test useEffect with invalid number', async () => {
  const setCountryCode = jest.fn();
  const setNumber = jest.fn();
  const setCountryCodeLength = jest.fn();
  const setCountryName = jest.fn();

  useState.mockImplementationOnce((init) => ['', setCountryCode]);
  useState.mockImplementationOnce((init) => ['1319200022', setNumber]);
  useState.mockImplementationOnce((init) => [init, setCountryCodeLength]);
  useState.mockImplementationOnce((init) => [init, setCountryName]);

  FractappClient.getLocalByIp.mockReturnValueOnce('');
  const component = await render(
    <EditPhoneNumber
      navigation={{setOptions: jest.fn()}}
      route={{
        params: {},
      }}
    />,
  );

  expect(setCountryName).toBeCalledWith(
    StringUtils.texts.edit.invalidPhoneNumber,
  );
});

it('Test click selectCountry', async () => {
  const navigate = jest.fn();
  const setCountryCode = jest.fn();
  const setNumber = jest.fn();
  const setCountryCodeLength = jest.fn();
  const setCountryName = jest.fn();

  useState.mockImplementationOnce((init) => ['', setCountryCode]);
  useState.mockImplementationOnce((init) => ['1319200022', setNumber]);
  useState.mockImplementationOnce((init) => [init, setCountryCodeLength]);
  useState.mockImplementationOnce((init) => [init, setCountryName]);

  FractappClient.getLocalByIp.mockReturnValueOnce('');
  const component = await render(
    <EditPhoneNumber
      navigation={{navigate: navigate, setOptions: jest.fn()}}
      route={{
        params: {},
      }}
    />,
  );

  fireEvent.press(component.getByTestId('selectCountryBtn'));
  expect(navigate).toBeCalledWith('SelectCountry');
});

