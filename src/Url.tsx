import React, { useEffect } from 'react';
import { View } from 'react-native';
import GlobalStore from 'storage/Global';
import backend from 'utils/api';
import { ChatInfo } from 'types/chatInfo';
import { useDispatch, useSelector } from 'react-redux';
import ChatsStore from 'storage/Chats';
import UsersStore from 'storage/Users';
import { toCurrency } from 'types/wallet';

const Url = ({navigation, route}: {navigation: any; route: any}) => {
  const dispatch = useDispatch();
  const chatsState: ChatsStore.State =  useSelector((state: any) => state.chats);

  const routeUrl: string = route.params.url;

  useEffect(() => {
    (async () => {
      dispatch(GlobalStore.actions.showLoading());

      let chat: ChatInfo | null = null;
      let url = routeUrl;

      try {
        let user = '';
        let type = '';
        let currency = '';
        if (url?.startsWith('fractapp://chat')) {
          url = url.replace('fractapp://chat/', '');
          const params = url.split('/');
          type = params[0];
          user = params[1];
          currency = params[2];
        } else {
          url = url.replace('https://send.fractapp.com/send.html?', '');
          const urlParams = url.split('&');
          for (let p of urlParams) {
            if (p.startsWith('type')) {
              type = p.replace('type=', '');
            } else if (p.startsWith('user')) {
              user = p.replace('user=', '');
            } else if (p.startsWith('currency')) {
              currency = p.replace('currency=', '');
            }
          }
        }
        console.log('Open link by user and type: ' + user + ' ' + type);

        if (chatsState.chatsInfo[user]) {
          chat = chatsState.chatsInfo[user]!;
        } else {
          let profile = null;
          if (type === 'user') {
            profile = await backend.getUserById(user);
          }

          if (type === 'user' && profile !== undefined) {
            dispatch(UsersStore.actions.setUsers([{
              isAddressOnly: false,
              title: profile?.name! !== '' ? profile?.name! : profile?.username!,
              value: profile!,
            }]));
            chat = {
              id: user,
              notificationCount: 0,
              lastMsgId: '',
            };
          } else if (type === 'address') {
            dispatch(UsersStore.actions.setUsers([{
              isAddressOnly: true,
              title: user,
              value: {
                address: user,
                currency: toCurrency(currency),
              },
            }]));
            chat = {
              id: user,
              notificationCount: 0,
              lastMsgId: '',
            };
          }
        }
      } catch (e) {
        console.log('Url err: ' + e.toString());
      }

      dispatch(GlobalStore.actions.hideLoading());
      if (chat !== null) {
        navigation.navigate('Chat', {
          chatId: chat,
        });
      } else {
        navigation.goBack();
      }
    })();


  }, []);

  return (
    <View
      style={{
        flex: 1,
      }} />
  );
};

export default Url;
