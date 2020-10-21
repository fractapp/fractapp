import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';


export const BlueButton = ({ text, height, width = "100%", onPress }: { text: string, height: number, width?: string, onPress: () => void} ) => {
    return (
        <TouchableOpacity style={[styles.button, {height: height, width: width} ]} onPress={onPress}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    buttonText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "white"
    },
    button: {
        backgroundColor: "#2AB2E2",
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    }
});