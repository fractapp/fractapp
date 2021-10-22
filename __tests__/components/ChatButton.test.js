import React from 'react';
import {ChatButton} from 'components/ChatButton';
import { fireEvent, render, act } from '@testing-library/react-native';
import { useDispatch } from 'react-redux';
import { DefaultMsgAction } from 'types/message';
import GlobalStore from 'storage/Global';

jest.mock('storage/DB', () => ({}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

const dispatch = jest.fn();
useDispatch.mockReturnValue(dispatch);

it('Test one', async () => {
  const component = await render(
      <ChatButton
        action={DefaultMsgAction.Broadcast}
        width={'100%'}
        isLast={false}
        text={'text'}
        imageUrl={''}
        onPress={async () => console.log('test')}
      />,
    );

  expect(component.toJSON()).toMatchSnapshot();

  await act(async () => fireEvent.press(component.getByText('text')));

  expect(dispatch).toBeCalledWith(GlobalStore.actions.showLoading());
});


it('Test two', () => {
  const component = render(
    <ChatButton
      action={DefaultMsgAction.Broadcast}
      width={'100%'}
      isLast={false}
      text={'text'}
      imageUrl={'img.png'}
      onPress={async () => console.log('test')}
    />,
  );

  expect(component.toJSON()).toMatchSnapshot();
});

