import React from 'react';
import {StyleSheet, View, Image, Text, TouchableHighlight} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {Currency} from 'types/wallet';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import {showMessage} from 'react-native-flash-message';
import StringUtils from 'utils/string';
import GlobalStore from 'storage/Global';
import { useSelector } from 'react-redux';

/**
 * Screen with receiver information and qr code
 * @category Screens
 */
export const Receive = ({route}: {route: any}) => {
  const globalState: GlobalStore.State = useSelector((state: any) => state.global);

  const address: string = route.params.address;
  const currency: Currency = route.params.currency;

  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <View style={styles.qrCode}>
        <View style={styles.title}>
          <Image
            source={require('assets/img/logo.png')}
            style={{width: 30, height: 30, marginRight: 10}}
          />
          <Text style={styles.titleText}>
            {StringUtils.texts.FractappWalletTitle}
          </Text>
        </View>
        <QRCode value={address} size={250} />
        <Text style={styles.address}>{address}</Text>
      </View>
      <View style={styles.btns}>
        <View style={styles.btn}>
          <TouchableHighlight
            testID="copyBtn"
            onPress={() => {
              Clipboard.setString(address);
              showMessage({
                message: StringUtils.texts.showMsg.addressCopied,
                type: 'info',
                icon: 'info',
              });
            }}
            underlayColor="#76C7E3"
            style={styles.btnImg}>
            <MaterialCommunityIcons
              name="content-copy"
              size={24}
              color="white"
            />
          </TouchableHighlight>
          <Text style={styles.btnText}>{StringUtils.texts.CopyBtn}</Text>
        </View>
        <View style={[styles.btn, {marginLeft: 30}]}>
          <TouchableHighlight
            testID="shareBtn"
            onPress={() =>
              Share.open({
                message: '',
                title: '',
                url: StringUtils.texts.MyAddressForShare(
                  currency,
                  address,
                  globalState.profile!.id,
                ),
                type: 'text/plain',
              })
            }
            underlayColor="#76C7E3"
            style={[styles.btnImg]}>
            <MaterialCommunityIcons
              name="upload-outline"
              size={24}
              color="white"
            />
          </TouchableHighlight>
          <Text style={styles.btnText}>{StringUtils.texts.ShareBtn}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btns: {
    marginTop: 30,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnImg: {
    width: 60,
    height: 60,
    backgroundColor: '#2AB2E2',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    paddingTop: 2,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    textAlign: 'center',
    color: 'black',
  },
  qrCode: {
    marginTop: 100,
    width: '80%',
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#BFBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    marginTop: 6,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    color: '#2AB2E2',
  },
  address: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
