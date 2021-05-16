import React from 'react';
import renderer from 'react-test-renderer';
import {AmountInput} from 'components/AmountInput';
import {Currency} from 'types/wallet';
import {Adaptors} from 'adaptors/adaptor';

jest.mock('storage/DB', () => ({}));
jest.mock('adaptors/adaptor', () => ({
  Adaptors: {
    get: jest.fn(),
  },
}));

it('Test one', () => {
  const tree = renderer
    .create(
      <AmountInput
        alternativeValue={123}
        fee={1000}
        currency={Currency.DOT}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <AmountInput
        alternativeValue={555}
        fee={100}
        currency={Currency.KSM}
        usdMode={true}
        value={'100'}
        width={'90%'}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
