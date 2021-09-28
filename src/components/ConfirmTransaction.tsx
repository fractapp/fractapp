import React, { useEffect, useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { getSymbol } from 'types/wallet';
import RBSheet from 'react-native-raw-bottom-sheet';
import { WalletInfo } from 'components/WalletInfo';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import { BlueButton } from './BlueButton';
import { WhiteButton } from 'components/WhiteButton';
import { ConfirmTxInfo, getNameTxAction } from 'types/inputs';
import { useDispatch, useSelector } from 'react-redux';
import DialogStore from 'storage/Dialog';
import ServerInfoStore from 'storage/ServerInfo';
import GlobalStore from 'storage/Global';
import ChatsStore from 'storage/Chats';
import { Adaptors } from 'adaptors/adaptor';
import { TxStatus } from 'types/transaction';
import AccountsStore from 'storage/Accounts';
import { AccountType } from 'types/account';
import { randomAsHex } from '@polkadot/util-crypto';

/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const ConfirmTransaction = ({
  isShow,
  confirmTxInfo,
}: {
  isShow: boolean,
  confirmTxInfo: ConfirmTxInfo
}) => {
  const dispatch = useDispatch();
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const accountsState: AccountsStore.State = useSelector((state: any) => state.accounts);

  const sender = accountsState.accounts[AccountType.Main][confirmTxInfo.accountCurrency];
  const api = Adaptors.get(sender.network)!;
  const price = serverInfoState.prices[sender.currency] ?? 0;
  const creator = confirmTxInfo.creator;

  const tokenValue = confirmTxInfo.tx.fullValue;
  const usdValue = confirmTxInfo.tx.usdValue;
  const usdFee = confirmTxInfo.tx.usdFee;

  const onConfirm = async () => {
    console.log('confirm');
    console.log('isLoadingShow: ' + globalState.loadInfo.isLoadingShow);
    if (globalState.loadInfo.isLoadingShow) {
      return;
    }
    console.log('send');

    dispatch(GlobalStore.actions.showLoading());
    popupRef.current!.close();

    let isError = false;
    try {
      const hash = await api.broadcast(confirmTxInfo.unsignedTx);

      const tx = confirmTxInfo.tx;

      console.log('tx hash: ' + hash);
      tx.hash = hash;
      tx.id = 'sent-' + hash;
      tx.status = TxStatus.Pending;
      dispatch(ChatsStore.actions.addPendingTx({
        tx: tx,
        owner: globalState.profile.id,
      }));
    } catch (e) {
      isError = true;
      console.log('error send tx');
    }

    try {
      const msg = {
        id: 'answer-' + randomAsHex(32),
        value: '',
        action: confirmTxInfo.msgArgs[isError ? 1 : 0],
        args: confirmTxInfo.msgArgs.slice(2, confirmTxInfo.msgArgs.length),
        rows: [],
        timestamp: Date.now(),
        sender: globalState.profile!.id,
        receiver: confirmTxInfo.creator.id,
        hideBtn: true,
      };

      await backend.sendMsg({
        version: 1,
        value: '',
        action: msg.action,
        receiver: msg.receiver,
        args: msg.args,
      });
    } catch (e) {
      console.log('error send msg');
    }

    dispatch(ChatsStore.actions.hideBtns({
      chatId: confirmTxInfo.creator.id,
      msgId: confirmTxInfo.msgId,
    }));

    dispatch(GlobalStore.actions.hideLoading());
    dispatch(DialogStore.actions.hideConfirmTxInfo());
  };

  let popupRef = useRef<RBSheet>(null);

  useEffect(() => {
    console.log('show: ' + isShow);
    if (isShow) {
      popupRef.current!.open();
    }
  }, [popupRef.current, isShow]);


  return (
    <RBSheet
      ref={popupRef}
      height={Dimensions.get('window').height * 0.9}
      onClose={() => dispatch(DialogStore.actions.hideConfirmTxInfo())}
      customStyles={{
        container: {
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
        },
      }}
    >
      <View style={{ flex: 1, paddingLeft: 15, paddingRight: 15 }}>
        <View style={{ height: Dimensions.get('window').height * 0.8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 25,
            }}>
            <Image
              source={{ uri: backend.getImgUrl(creator.id, creator.lastUpdate) }}
              style={{
                borderRadius: 55,
                width: 55,
                height: 55,
              }}
            />
            <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
              <View style={{ height: 23, flexDirection: 'row' }}>
                <Text style={{
                  fontSize: 15,
                  fontFamily: 'Roboto-Regular',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  color: 'black',
                  textAlign: 'left',
                }}>
                  {creator.name.trim() === '' ? '@' + creator.username : creator.name}
                </Text>
              </View>
              {creator.name.trim() !== '' ? (
                <View style={{ height: 23, flexDirection: 'row' }}>
                  <Text style={[{
                    fontSize: 15,
                    fontFamily: 'Roboto-Regular',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    color: '#888888',
                    textAlign: 'left',
                  }]}>
                    {creator.username}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View style={[styles.info, { marginTop: 30 }]}>
            <View style={styles.type}>
              <Text style={styles.typeText}>{getNameTxAction(confirmTxInfo.action)}</Text>
            </View>
            <Text style={styles.valueUsd}>
              ${usdValue}
            </Text>
            <Text style={styles.tokenValue}>
              ({tokenValue} {getSymbol(sender.currency)})
            </Text>
            {(confirmTxInfo.warningText != null || confirmTxInfo.errorText != null) &&
            (
              <View style={[styles.warning, { borderColor: confirmTxInfo.errorText != null ? '#ea4335' : '#F39B34'  }]}>
                <Text style={[styles.warningText, {color: confirmTxInfo.errorText != null ? '#EA4335' : '#F39B34' }]}>
                  {confirmTxInfo.errorText != null ? confirmTxInfo.errorText : confirmTxInfo.warningText}
                </Text>
              </View>
            )
            }
          </View>
          <View style={{ marginTop: 30 }}>
            <Text style={styles.title}>{StringUtils.texts.WriteOffAccountTitle}</Text>
            <WalletInfo width={'100%'} paddingLeft={'0%'} account={sender} price={price} />
          </View>
          <View style={{ width: '100%', flexDirection: 'column', marginTop: 20 }}>
            <Text style={[styles.title, { marginBottom: 5 }]}>
              {StringUtils.texts.FeeTitle}
            </Text>
            <Text style={styles.fee}>${usdFee}</Text>
          </View>
        </View>
        <View style={[styles.buttonsBlock]}>
          <WhiteButton
            width={'40%'}
            color={'black'}
            text={'Cancel'}
            height={50}
            onPress={() => popupRef.current!.close()}
          />
          <View style={{ width: '40%', marginLeft: 40 }}>
            <BlueButton
              text={'OK'}
              height={50}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'flex-start',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  fee: {
    alignSelf: 'flex-start',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: 'black',
  },
  info: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
    borderColor: '#888888',
    borderWidth: 0.5,
    borderRadius: 10,
  },
  type: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 30,
    paddingRight: 30,
    borderColor: '#2AB2E2',
    borderWidth: 0.5,
    borderRadius: 30,
  },
  typeText: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    fontStyle: 'normal',
    color: '#2AB2E2',
  },
  valueUsd:{
    marginTop: 15,
    fontSize: 40,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: '#888888',
  },
  tokenValue:{
    fontSize: 20,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    color: 'black',
  },
  warning: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 0.5,
    borderRadius: 10,
  },
  warningText:{
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    fontStyle: 'normal',
  },
  buttonsBlock: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
