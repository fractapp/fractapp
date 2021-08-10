import React, { useContext } from 'react';
import {Receive} from 'screens/Receive';
import renderer from 'react-test-renderer';
import {Currency, getSymbol} from 'types/wallet';
import {render, fireEvent} from '@testing-library/react-native';
import Clipboard from '@react-native-community/clipboard';
import {showMessage} from 'react-native-flash-message';
import Share from 'react-native-share';
import GlobalStore from 'storage/Global';

jest.mock('storage/DB', () => ({}));

jest.mock('react-native-qrcode-svg', () => ({value, size}) => {
  const React = require('react');
  const ReactNative = require('react-native');
  return (
    <ReactNative.View>
      <ReactNative.Text>{value}</ReactNative.Text>
      <ReactNative.Text>{size}</ReactNative.Text>
    </ReactNative.View>
  );
});
jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));
jest.mock('@react-native-community/clipboard', () => ({
  setString: jest.fn(),
}));
jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test receive #1', () => {
  const tree = renderer
    .create(
      <Receive
        route={{
          params: {
            address: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
            currency: Currency.DOT,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test receive #2', () => {
  const params = {
    address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
    currency: Currency.KSM,
  };

  const tree = renderer.create(<Receive route={{params: params}} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test receive click copy', () => {
  const params = {
    address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
    currency: Currency.KSM,
  };

  const component = render(<Receive route={{params: params}} />);
  fireEvent.press(component.getByTestId('copyBtn'));
  expect(Clipboard.setString).toBeCalledWith(params.address);
  expect(showMessage).toBeCalledWith({
    message: 'show_msg.address_copied',
    type: 'info',
    icon: 'info',
  });
});

it('Test receive click share', () => {
  const params = {
    address: 'F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE',
    currency: Currency.KSM,
    shareLink: 'https://send.fractapp.com/send.html?user=F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE&type=address&currency=KSM',
  };

  const component = render(<Receive route={{params: params}} />);
  fireEvent.press(component.getByTestId('shareBtn'));
  expect(Share.open).toBeCalledWith({
    url: `share_text ${getSymbol(params.currency)}: ${params.address}\n\nshare_link: ${params.shareLink}`,
    type: 'text/plain',
    title: '',
    message: '',
  });
});
