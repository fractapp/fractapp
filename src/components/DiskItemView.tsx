import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DiskItem } from 'models/google'
import { Type } from 'models/google'

export const DiskItemView = ({ item, onPress }: { item: DiskItem, onPress: () => void }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <View style={{ flexDirection: "row" }}>
            {
                item.type == Type.Dir ?
                    <Feather name="folder" size={30} color={"#888888"} /> :
                    <AntDesign name="file1" size={30} color={"#888888"} />
            }

            <Text style={styles.itemText}>{item.title.length > 25 ? item.title.substring(0, 25) + "..." : item.title}</Text>
        </View>
    </TouchableOpacity>
);


const styles = StyleSheet.create({
    item: {
        height: 50,
        justifyContent: 'center'
    },
    itemText: {
        marginLeft: 10,
        fontSize: 20,
        fontFamily: "Roboto-Regular",
        color: "black",
    }
});