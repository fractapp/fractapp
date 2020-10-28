import React from 'react';
import { Receive } from 'screens/Receive';
import renderer from 'react-test-renderer';
import { Currency, getSymbol } from 'models/wallet';
import { render, fireEvent } from '@testing-library/react-native';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from "react-native-flash-message";
import Share from 'react-native-share'

jest.mock('react-native-qrcode-svg', () => ({ value, size }: { value: string, size: number }) => {
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
    setString: jest.fn()
}));
jest.mock('react-native-flash-message', () => ({
    showMessage: jest.fn(),
}));

it('Test receive #1', () => {
    const tree = renderer
        .create(<Receive route={{
            params: {
                address: "1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE",
                currency: Currency.Polkadot
            }
        }} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test receive #2', () => {
    const params = {
        address: "F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE",
        currency: Currency.Kusama
    }

    const tree = renderer
        .create(<Receive route={{ params: params }} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test receive click copy', () => {
    const params = {
        address: "F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE",
        currency: Currency.Kusama
    }

    const component = render(<Receive route={{ params: params }} />)
    fireEvent.press(component.getByTestId('copyBtn'));
    expect(Clipboard.setString).toBeCalledWith(params.address);
    expect(showMessage).toBeCalledWith({
        message: "Address copied",
        type: "info",
        icon: "info"
    });
});

it('Test receive click share', () => {
    const params = {
        address: "F7Zbj7rRJQLQVvQn8tKnWmSByAoFFYKYd17hSxdmYbcZzoE",
        currency: Currency.Kusama
    }

    const component = render(<Receive route={{ params: params }} />)
    fireEvent.press(component.getByTestId('shareBtn'));
    expect(Share.open).toBeCalledWith({
        url: `My address for ${getSymbol(params.currency)}: ${params.address}`,
        type: "text/plain"
    });
});