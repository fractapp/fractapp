import React, {useEffect} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import GlobalStore from 'storage/Global';
import {WhiteButton} from 'components/WhiteButton';
import backup from 'utils/backup';
import googleUtil from 'utils/google';
import StringUtils from 'utils/string';
import { useDispatch } from 'react-redux';

/**
 * Choose import wallet file import screen
 * @category Screens
 */
export const ChooseImportWallet = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const dispatch = useDispatch();

  const type: backup.BackupType = route.params.type;
  const wallets: Array<string> = route.params.wallets;
  const ids: Array<string> = route.params?.ids;

  const open = (v: string) => {
    dispatch(GlobalStore.actions.showLoading());
    if (type === backup.BackupType.File) {
      backup
        .getFile(v)
        .then((file) => {
          navigation.navigate('WalletFileImport', {
            file: file,
          });
          setTimeout(
            () => dispatch(GlobalStore.actions.hideLoading()),
            500,
          );
        })
        .catch(() => {
          dispatch(GlobalStore.actions.hideLoading());
        });
    } else if (type === backup.BackupType.GoogleDrive) {
      googleUtil
        .getFileBackup(v)
        .then((file) => {
          navigation.navigate('WalletFileImport', {
            file: file,
          });
          setTimeout(
            () => dispatch(GlobalStore.actions.hideLoading()),
            500,
          );
        })
        .catch(() => {
          dispatch(GlobalStore.actions.hideLoading());
        });
    }
  };

  useEffect(() => {
    dispatch(GlobalStore.actions.hideLoading());
  }, []);

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>{StringUtils.texts.ChooseWalletTitle}</Text>

      <FlatList
        style={{
          flex: 1,
          marginTop: 30,
          width: '90%',
        }}
        data={wallets}
        renderItem={({item}) => {
          return (
            <View style={{marginBottom: 20}}>
              <WhiteButton
                text={item.replace('.json', '')}
                height={50}
                onPress={() => {
                  if (type === backup.BackupType.File) {
                    open(wallets[0]);
                  } else if (type === backup.BackupType.GoogleDrive) {
                    open(ids[0]);
                  }
                }}
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => item + index}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  noResultsText: {
    marginTop: 10,
    fontSize: 19,
    fontFamily: 'Roboto-Regular',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#888888',
  },
  title: {
    marginTop: 80,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    textAlign: 'center',
    width: '90%',
    marginTop: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
  newPassword: {
    marginTop: 30,
    width: '90%',
  },
  confirmPassword: {
    marginTop: 20,
    width: '90%',
  },
  error: {
    marginTop: 20,
    color: 'red',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
});
