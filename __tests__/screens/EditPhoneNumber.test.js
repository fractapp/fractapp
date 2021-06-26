import React, {useState} from 'react';
import renderer from 'react-test-renderer';
import {EditPhoneNumber} from 'screens/EditPhoneNumber';
import BackendApi from 'utils/backend';
import {fireEvent, render} from '@testing-library/react-native';
import StringUtils from 'utils/string';
jest.mock('storage/DB', () => ({}));
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  Linking: jest.fn(() => ({
    openURL: jest.fn(),
  })),
}));
jest.mock('utils/backend', () => ({
  getLocalByIp: jest.fn(),
}));
jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test view with empty number', async () => {
  useState.mockImplementation((init) => [init, jest.fn()]);

  BackendApi.getLocalByIp.mockReturnValueOnce('AD');
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

  BackendApi.getLocalByIp.mockReturnValueOnce('AD');
  const component = await render(
    <EditPhoneNumber
      navigation={{setOptions: jest.fn()}}
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

  BackendApi.getLocalByIp.mockReturnValueOnce('AG');
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

  BackendApi.getLocalByIp.mockReturnValueOnce('');
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

  BackendApi.getLocalByIp.mockReturnValueOnce('');
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

  BackendApi.getLocalByIp.mockReturnValueOnce('');
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

/*it('Test onSuccess', async () => {
  const navigate = jest.fn();
  const setNumber = jest.fn();
  useState.mockImplementationOnce((init) => ['1319200022', setNumber]);

  BackendApi.getLocalByIp.mockReturnValueOnce('');
  const component = await render(
    <EditPhoneNumber
      navigation={{navigate: navigate, setOptions: jest.fn()}}
      route={{
        params: {},
      }}
    />,
  );
  fireEvent.press(component.getByTestId('successBtn'));
  expect(navigate).toBeCalledWith('ConfirmCode');
});
*/