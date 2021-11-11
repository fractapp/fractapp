import React from 'react';
import renderer from 'react-test-renderer';
import {ChatShortInfo} from 'components/ChatShortInfo';
import { AddressOnly, Profile } from 'types/profile';
import { Currency } from 'types/wallet';

jest.mock('utils/fractappClient', () => ({
  getImgUrl: jest.fn(),
}));
it('Test one', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={10}
        message={'Test'}
        user={{
          isAddressOnly: true,
          title: 'address#1',
          value: {
            address: 'address#1',
            currency: Currency.DOT,
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test two', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={0}
        message={'Test2'}
        user={{
          isAddressOnly: false,
          title: 'user',
          value: {
            id: 'id',
            name: 'name',
            username: 'username',
            avatarExt: 'png',
            lastUpdate: new Date('12-12-2020').getTime(),
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test three', () => {
  const tree = renderer
    .create(
      <ChatShortInfo
        name={'name'}
        notificationCount={10}
        message={'Test3'}
        user={{
          isAddressOnly: false,
          title: 'user',
          value: {
            id: 'id',
            name: 'name',
            username: 'username',
            avatarExt: 'png',
            lastUpdate: new Date('12-12-2020').getTime(),
            addresses: {
              0: 'addressOne',
              1: 'addressTwo',
            },
          },
        }}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
