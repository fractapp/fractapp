import React, { useContext } from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {WalletLogo} from 'components/WalletLogo';
import backend from 'utils/backend';
import { ChatInfo, DefaultDetails } from 'types/chatInfo';
import GlobalStore from 'storage/Global';
import { UserProfile } from 'types/profile';
import StringUtils from 'utils/string';

/**
 * Screen with transaction details
 * @category Screens
 */
export const ProfileInfo = ({route}: {navigation: any, route: any}) => {
    const globalContext = useContext(GlobalStore.Context);

    const userInfo: UserProfile = route.params?.userInfo;
    const addressInfo: any = route.params?.addressInfo;
    const addressesArray = [];
    let addressTitle = '';

    if (addressInfo === null) {
        for (let key in userInfo.addresses) {
            addressesArray.push(userInfo.addresses[key]);
        }
    } else {
        addressTitle = StringUtils.formatNameOrAddress(addressInfo.details.address);
        addressesArray.push(addressInfo.details?.address);
    }
    return (
        <View style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}>
            <View style={{paddingLeft: 23, paddingRight: 22, paddingTop: 39}}>
                <Image
                    source={{
                        uri: backend.getImgUrl(
                            globalContext.state.users.get(userInfo.id)?.id ?? '0',
                            globalContext.state.users.get(userInfo.id)?.lastUpdate ?? 0,
                        ),
                    }}
                    width={130}
                    height={130}
                    style={styles.image}
                />
                <View style={{alignItems: 'center', marginTop: 10}}>
                    {addressInfo === null ? (
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 15, fontWeight: 'bold'}}>{userInfo.name}</Text>
                            <Text style={{marginTop: 4, fontSize: 15, color: '#888888'}}>@{userInfo.username}</Text>
                        </View>

                    ) : (
                        <Text style={{fontSize: 15, fontWeight: 'bold'}}>{addressTitle}</Text>
                    )}
                </View>
                {addressInfo === null ? (
                    <View style={styles.buttonsBlock}>
                        <TouchableOpacity style={styles.sendBtn}>
                            <Text style={styles.btnText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.muteBtn}>
                            <Text style={styles.btnText}>Mute</Text>
                        </TouchableOpacity>
                    </View>

                ) : (
                    <View style={styles.buttonsBlock}>
                        <TouchableOpacity  style={styles.sendBtnAddress}>
                            <Text style={styles.btnText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.muteBtnAddress}>
                            <Text style={styles.btnText}>Mute</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addAddress}>
                            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Image
                                    source={require('assets/img/plus.png')}
                                    width={10}
                                    height={10}
                                    style={styles.imagePlus}
                                />
                                <Image
                                    source={require('assets/img/human.png')}
                                    width={10}
                                    height={10}
                                    style={styles.imageHuman}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                <Text style={styles.addressTitle}>Address</Text>
                <View style={styles.addressBlock}>
                    {addressInfo === null ? (
                        addressesArray.map((address, index) => {
                            return (
                                <View style={styles.address} key={index}>
                                    <WalletLogo currency={index} size={40} />
                                    <View style={{width: '90%',flexDirection: 'row' , alignItems: 'center'}}>
                                        <Text style={styles.addressText}>{address}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        addressesArray.map((address, index) => (
                            <View style={styles.address} key={index}>
                                <WalletLogo currency={addressInfo.details?.currency!} size={40} />
                                <View style={{width: '90%',flexDirection: 'row' , alignItems: 'center'}}>
                                    <Text style={styles.addressText}>{address}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 130,
        height: 130,
        borderRadius: 90,
        alignSelf: 'center',
    },
    buttonsBlock: {
        flexDirection: 'row',
        marginTop: 25,
        width: '100%',
        height: 43,
    },
    sendBtn: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 155,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
        marginRight: 20,
    },
    muteBtn: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 155,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
    },
    btnText: {
        color: '#2AB2E2',
        textAlign: 'center',
    },
    addressTitle: {
        marginTop: 25,
        fontWeight: 'bold',
    },
    addressBlock: {
        alignSelf: 'center',
    },
    address: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'flex-end',

    },
    addressText: {
        alignSelf: 'center',
        marginLeft: 15,
        justifyContent: 'center',
    },

    sendBtnAddress: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 100,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
        marginRight: 16,
    },
    muteBtnAddress: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 100,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
        marginRight: 16,
    },
    addAddress: {
        borderColor: '#2AB2E2',
        borderWidth: 1,
        width: 100,
        height: 43,
        borderRadius: 10,
        justifyContent: 'center',
    },
    imagePlus: {
        width: 12,
        height: 12,
        borderRadius: 90,
        alignSelf: 'center',
    },
    imageHuman: {
        width: 18,
        height: 19,
        borderRadius: 90,
        alignSelf: 'center',
    },
});
