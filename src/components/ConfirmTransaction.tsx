import React from 'react';
import {StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import { useContext } from 'react';
import { Currency, Wallet, getSymbol } from 'types/wallet';
import { TxActionType } from 'types/transaction';
import { useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useEffect } from 'react';
import PricesStore from 'storage/Prices';
import { useState } from 'react';
import AccountsStore from 'storage/Accounts';
import {WalletInfo} from 'components/WalletInfo';
import StringUtils from 'utils/string';
import math from 'utils/math';
import backend from 'utils/backend';
import GlobalStore from 'storage/Global';
import { UserProfile } from 'types/profile';
import {WalletLogo} from 'components/WalletLogo';
import warningIcon from 'assets/img/warningIcon.png';
import { BlueButton } from './BlueButton';
/**
 * Popup dialog component with 1 button
 * @category Components
 */
export const ConfirmTransaction = ({
  type = TxActionType.Donate,
  value = 10.1234,
  currency = Currency.KSM,
  actionUser = '93b665d09f9dd25d6fcf288afc53d503baf17ab9dfc56eb80cff32744fd539e3',
  fee = 1,
  warningText = 'warningText warningText warningText warningText warningText ',
  onCancel,
  onConfirm,
}: {
  type: number;
  value: number;
  currency: Currency;
  actionUser: string;
  fee: number;
  warningText: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const refRBSheet = useRef();

  const accountsContext = useContext(AccountsStore.Context);
  const priceContext = useContext(PricesStore.Context);
  const globalContext = useContext(GlobalStore.Context);

  const [valueUsd, setValueUsd] = useState<number>();
  const [txType, setTxType] = useState<string>();
  const [wallet, setWallet] = useState<Wallet>();
  const [user, setUser] = useState<UserProfile>();

  useEffect(() => {
    let price = 0;
    if (accountsContext.state.accounts.has(currency)) {
      if (priceContext.state.has(currency)) {
        price = priceContext.state.get(currency)!;
      }
      let account = accountsContext.state.accounts.get(currency)!;
      setWallet(
        new Wallet(
        account.name,
        account.address,
        account.currency,
        account.network,
        account.balance,
        account.planks,
        price,
      ));
    }
    setValueUsd(math.roundUsd(price * value));
    setUser(globalContext.state.users.get(actionUser)!);

    switch (type) {
      case TxActionType.Donate:
        setTxType('Donate');
        break;
      default:
        break;
    }
  },[]);
  value = math.round(value, 3);
  return (
    <View
      style={{
        flex:1,
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Button title='OPEN BOTTOM SHEET' onPress={() => refRBSheet.current.open()} />
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
              {user != null ? (
                  <Image
                    source={{
                      uri: backend.getImgUrl(user.id, user.lastUpdate),
                    }}
                    width={50}
                    height={50}
                    style={styles.img}
                  />
                ) : (
                  <WalletLogo currency={currency} size={50} />
              )}
            </View>
            <View style={styles.userTitle}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.userName}>@{user.username}</Text>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <View style={styles.info}>
              <View style={styles.type}>
                  <Text style={styles.typeText}>{txType}</Text>
              </View>
                <Text style={styles.valueUsd}>
                  ${valueUsd}
                </Text>
                <Text>
                  ({value} {getSymbol(currency)})
                </Text>
              <View style={styles.warning}>
                <View style={styles.warningImgBlock}>
                  <Image
                    source={warningIcon}
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
            <WalletInfo wallet={wallet!} />
          </View>
          <View style={styles.fee}>
            <Text style={styles.feeTitle}>Fee</Text>
            <Text>
              {fee} {getSymbol(currency)} (${fee})
            </Text>
          </View>
          <View style={styles.buttonsBlock}>
            <View style={styles.buttonCancelBlock}>
              <TouchableOpacity
                style={styles.buttonCancel}
                disabled={false}
                onPress={()=>{onCancel}}>
                <Text style={styles.buttonCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonConfirm}>
              <BlueButton
                text={'OK'} height={50}
                onPress={()=>{onConfirm}}
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

/*

*/
