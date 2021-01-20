import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Wallet} from 'models/wallet';
import {WalletInfo, Receiver, BlueButton, AmountValue} from 'components/index';
import {ReceiverType} from 'components/Receiver';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const Send = ({navigation, route}: {navigation: any; route: any}) => {
  const wallet: Wallet = route.params.wallet;
  const receiver: string = route.params.receiver;
  const avatar: any = route.params?.avatar;

  return (
    <View style={styles.chats}>
      <WalletInfo wallet={wallet} />
      <MaterialIcons name={'keyboard-arrow-down'} size={25} />
      <Receiver
        currency={wallet.currency}
        nameOrAddress={receiver}
        type={ReceiverType.Standard}
      />
      <View style={{width: '100%', marginTop: 10, alignItems: 'center'}}>
        <AmountValue value={''} width={'90%'} onPress={() => console.log('')} />
      </View>
      <View style={{width: '85%', marginTop: 60}}>
        <BlueButton
          text={'Send'}
          height={55}
          onPress={() => console.log('---')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chats: {
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  dividingLine: {
    marginLeft: 80,
    width: '100%',
    height: 1,
    backgroundColor: '#ededed',
  },
});
