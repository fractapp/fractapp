import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableHighlight } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PhoneInput from "react-native-phone-number-input";

export const EditProfile = ({ navigation }: { navigation: any }) => {
    const Inputs = [
        {
            title: "Name",
            value: "Elshan Dzhafarov"
        },
        {
            title: "Username",
            value: "CryptoBadBoy"
        },
        {
            title: "Phone",
            value: "Write you phone"
        },
        {
            title: "Email",
            value: "Write your email"
        },
        {
            title: "Twitter",
            value: "Connect your twitter"
        }
    ]

    const renderItem = (item: any) => {
        const input = item.item
        return (
            <TouchableHighlight
                key={input.title}
                // onPress={() => navigation.navigate('EditProfile', { title: item.title })}
                underlayColor="#f8f9fb"
            >
                <View style={styles.input}>
                    <Text style={styles.title}>{input.title}</Text>
                    <Text style={styles.value}>{input.value}</Text>
                </View>
            </TouchableHighlight>
        )
    }
    return (
        <View style={styles.profile}>
            <View style={styles.avatar}>
                <MaterialCommunityIcons name="account-circle-outline" size={70} color="#2AB2E2" />
            </View>
            <View style={{ width: '90%' }}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={Inputs}
                    renderItem={renderItem}
                    keyExtractor={item => item.title}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profile: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        marginTop: 20,
        width: 120,
        height: 120,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        marginTop: 20,
        paddingBottom: 5,
        borderColor: '#CCCCCC',
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontFamily: "RobotoRegular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "#888888",
    },
    value: {
        marginTop: 6,
        fontSize: 18,
        fontFamily: "RobotoRegular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "black",
    }
});