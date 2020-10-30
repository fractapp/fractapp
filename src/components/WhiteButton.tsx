import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * Image type
 * @category Components
 */
export enum Img {
    None,
    GoogleDrive,
    File,
    Key,
    Copy
}

/**
 * @category Components
 */
export const WhiteButton = ({ text, height, onPress, img = Img.None, width = "100%" }: { text: string, height: number, img?: Img, width?: string, onPress: () => void }) => {
    let imageView: any
    switch (img) {
        case Img.GoogleDrive:
            imageView = <Image source={require("assets/img/google-drive.png")} style={[styles.img, { width: 30, height: 30 }]} />
            break;
        case Img.File:
            imageView = <MaterialIcons name="folder-open" size={30} color="#888888" style={styles.img} />
            break;
        case Img.Key:
            imageView = <MaterialCommunityIcons name="key-outline" size={30} color="#888888" style={styles.img} />
            break;
        case Img.Copy:
            imageView = <MaterialCommunityIcons name="content-copy" size={27} color="#888888" style={styles.img} />
            break;
    }

    return (
        <TouchableOpacity style={[styles.button, { height: height, width: width }]} onPress={onPress}>
            {imageView}
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    img: {
        position: 'absolute',
        left: 70
    },
    buttonText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontStyle: "normal",
        fontWeight: "normal",
        color: "black"
    },
    button: {
        borderColor: "black",
        borderWidth: 0.5,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    }
});