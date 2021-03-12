import React from 'react';
import renderer from 'react-test-renderer';
import {EnterAddress} from 'components/EnterAddress';
import {Currency} from 'types/wallet';

it('Test one', () => {
  const tree = renderer
    .create(
      <EnterAddress
        value={'value'}
        isValid={true}
        currency={Currency.Polkadot}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <EnterAddress
        value={'1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE'}
        isValid={false}
        currency={Currency.Kusama}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test three', () => {
  const tree = renderer
    .create(
      <EnterAddress
        value={''}
        isValid={false}
        currency={Currency.Kusama}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
