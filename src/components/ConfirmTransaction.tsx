import React from 'react';
import {StyleSheet, Text, View, Image, Button} from 'react-native';
import { Currency, getSymbol } from 'types/wallet';
import { getNameTxAction, TxActionType } from 'types/transaction';
import { useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {WalletInfo} from 'components/WalletInfo';
import StringUtils from 'utils/string';
import backend from 'utils/api';
import { BlueButton } from './BlueButton';
import { Profile } from 'types/profile';
import { Account } from 'types/account';
import MathUtils from 'utils/math';
import { WhiteButton } from 'components/WhiteButton';
/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const ConfirmTransaction = ({
  action,
  value,
  currency,
  profile,
  price,
  account,
  fee,
  warningText,
  onCancel,
  onConfirm,
}: {
  action: TxActionType;
  value: number;
  currency: Currency;
  profile: Profile;
  price: number;
  account: Account;
  fee: number;
  warningText: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const refRBSheet = useRef();
  return (
    <View
      style={{
        flex:1,
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Button title="OPEN BOTTOM SHEET" onPress={() => refRBSheet.current?.open()} />
      <RBSheet
        ref={refRBSheet}
        closeOnPressMask={true}
        height={610}
        customStyles={{
          wrapper: {
            backgroundColor: 'gray',
          },
          container: {
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,

          },
        }}
      >
        <View style={{flexDirection: 'column', flex: 1}}>
          <View style={styles.user}>
            <View>
              {
                <Image
                  source={{
                    uri: backend.getImgUrl(profile.id, profile.lastUpdate),
                  }}
                  width={50}
                  height={50}
                  style={styles.img}
                />
              }
            </View>
            <View style={styles.userTitle}>
              <Text style={styles.name}>{profile.name /*TODO: empty name*/}</Text>
              <Text style={styles.userName}>@{profile.username}</Text>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <View style={styles.info}>
              <View style={styles.type}>
                  <Text style={styles.typeText}>{getNameTxAction(action)}</Text>
              </View>
                <Text style={styles.valueUsd}>
                  ${MathUtils.roundUsd(value * price)}
                </Text>
                <Text>
                  ({value} {getSymbol(currency)})
                </Text>
              <View style={styles.warning}>
                <View style={styles.warningImgBlock}>
                  <Image
                    source={require('assets/img/warning-icon.png')}
                    width={50}
                    height={50}
                    style={styles.warningImg}
                  />
                </View>
                <Text style={styles.warningText}>
                  {warningText}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.transaction}>
            <Text style={styles.writeOff}>
              {StringUtils.texts.WriteOffAccountTitle}
            </Text>
            <WalletInfo account={account} price={price} />
          </View>
          <View style={styles.fee}>
            <Text style={styles.feeTitle}>Fee</Text>
            <Text>
              {fee} {getSymbol(currency)} (${fee})
            </Text>
          </View>
          <View style={styles.buttonsBlock}>
            <View style={styles.buttonCancelBlock}>
              <WhiteButton
                text={'Cancel'} height={50}
                onPress={onCancel}
              />
            </View>
            <View style={styles.buttonConfirm}>
              <BlueButton
                text={'OK'} height={50}
                onPress={onConfirm}
              />
            </View>

          </View>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width:'100%',
    marginTop: 20,
    paddingLeft: 15,
  },
  name: {
    fontWeight: 'bold',
  },
  userName: {
    color: '#888888',
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 45,
  },
  userTitle: {
    marginLeft: 10,
  },
  infoBlock: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  info: {
    width: '98%',
    marginTop: 30,
    paddingTop: 10,
    paddingBottom: 20,
    borderColor: '#888888',
    borderWidth: 0.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf:'center',
  },
  type: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '28%',
    paddingTop: 2,
    paddingBottom: 2,
    borderColor: '#2AB2E2',
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 10,
  },
  typeText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#2AB2E2',
  },
  valueUsd:{
    marginTop: 10,
    fontSize: 30,
    color: '#888888',
  },
  warning: {
    width: '90%',
    marginTop: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: '#F39B34',
    borderWidth: 0.5,
    borderRadius: 10,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  warningImgBlock: {
    width: '100%',
    alignItems: 'flex-start',
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 10,
  },
  warningImg: {
    width: 15,
    height: 15,
  },
  warningText:{
    color: '#F39B34',
    textAlign: 'center',
    paddingLeft:15,
  },
  transaction: {
    width: '100%',
    marginTop: 30,
  },
  writeOff: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    fontSize: 17,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  fee: {
    marginTop: 15,
    paddingLeft: 20,
    paddingRight: 20,
  },
  feeTitle: {
    color: '#888888',
  },
  buttonsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonCancelBlock: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#888888',
  },
  buttonCancelText: {
    color: '#888888',
  },
  buttonConfirm: {
    width: '40%',
    marginLeft: 30,
  },
});
