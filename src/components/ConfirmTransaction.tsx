import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions } from 'react-native';
import { getSymbol } from 'types/wallet';
import { useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {WalletInfo} from 'components/WalletInfo';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import { BlueButton } from './BlueButton';
import MathUtils from 'utils/math';
import { WhiteButton } from 'components/WhiteButton';
import { ConfirmTxInfo, getNameTxAction } from 'types/inputs';
import { useDispatch, useSelector } from 'react-redux';
import DialogStore from 'storage/Dialog';
import ServerInfoStore from 'storage/ServerInfo';
import { Adaptors } from 'adaptors/adaptor';
import BN from 'bn.js';

/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const ConfirmTransaction = ({
  isShow,
  confirmTxInfo,
  onConfirm,
}: {
  isShow: boolean,
  confirmTxInfo: ConfirmTxInfo,
  onConfirm: () => void;
}) => {
  const dispatch = useDispatch();
  const serverInfoState: ServerInfoStore.State = useSelector((state: any) => state.serverInfo);
  const price = serverInfoState.prices[confirmTxInfo.sender.currency] ?? 0;
  const api = Adaptors.get(confirmTxInfo.sender.network);

  const tokenValue =
    api === undefined ?
      0 :
      MathUtils.convertFromPlanckToViewDecimals(new BN(confirmTxInfo.planksValue), api.decimals, api.viewDecimals);
  const usdValue = api === undefined ?
    0 :
    MathUtils.roundUsd(tokenValue * price);
  const tokenFee = api === undefined ?
    0 :
    MathUtils.convertFromPlanckToViewDecimals(new BN(confirmTxInfo.planksFee), api.decimals, api.viewDecimals);
  const usdFee = api === undefined ?
    0 :
    MathUtils.roundUsd(tokenFee * price);

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
              source={{ uri: backend.getImgUrl(confirmTxInfo.creator.id, confirmTxInfo.creator.lastUpdate) }}
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
                  {confirmTxInfo.creator.name.trim() === '' ? '@' + confirmTxInfo.creator.username : confirmTxInfo.creator.name}
                </Text>
              </View>
              {confirmTxInfo.creator.name.trim() !== '' ? (
                <View style={{ height: 23, flexDirection: 'row' }}>
                  <Text style={[{
                    fontSize: 15,
                    fontFamily: 'Roboto-Regular',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    color: '#888888',
                    textAlign: 'left',
                  }]}>
                    {confirmTxInfo.creator.username}
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
              ({tokenValue} {getSymbol(confirmTxInfo.sender.currency)})
            </Text>
            {(confirmTxInfo.warningText != null || confirmTxInfo.errorText != null) &&
            (
              <View style={[styles.warning, { borderColor: confirmTxInfo.errorText != null ? '#EA4335' : '#F39B34'  }]}>
                <Text style={[styles.warningText, {color: confirmTxInfo.errorText != null ? '#EA4335' : '#F39B34' }]}>
                  {confirmTxInfo.errorText != null ? confirmTxInfo.errorText : confirmTxInfo.warningText}
                </Text>
              </View>
            )
            }
          </View>
          <View style={{ marginTop: 30 }}>
            <Text style={styles.title}>{StringUtils.texts.WriteOffAccountTitle}</Text>
            <WalletInfo width={'100%'} paddingLeft={'0%'} account={confirmTxInfo.sender} price={price} />
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
            color={'#888888'}
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
