import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, BackHandler, Alert } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { DriveItem, BackItemId } from 'models/google'
import { FileBackup } from 'models/backup';
import { Type } from 'models/google'
import { Loader, DriveItemView } from 'components'
import googleUtil from 'utils/google'

export const GoogleDrivePicker = ({ navigation }: { navigation: any }) => {
    const [paths, setPaths] = useState<Array<string>>(new Array("root"))
    const [items, setItems] = useState<Array<DriveItem>>()
    const [isLoading, setLoading] = useState<boolean>(true)

    const update = async () => {
        const last = paths[paths.length - 1]

        const items = await googleUtil.getItems(last)
        await setItems(paths.length > 1 ? [new DriveItem(BackItemId, "...", Type.Dir), ...items] : items)
    }

    const openJson = async (id: string) => {
        try {
            let file: FileBackup;
            try {
                file = await googleUtil.getFileBackup(id)
            } catch (err) {
                Alert.alert("Error", "Invalid file")
                console.log(err)
                return
            }
            navigation.navigate("WalletFileImport", { file: file })
        } catch (err) {
            console.log(err)
        }
    }

    const open = (path: string, type: Type) => {
        if (type == Type.Json) {
            openJson(path)
            return
        }
        setPaths([...paths, path])
        setLoading(true)
    }

    const back = () => {
        if (paths.length <= 1)
            return

        setPaths(paths.filter(path => path !== paths[paths.length - 1]))
        setLoading(true)
    }

    useEffect(() => {
        if (isLoading) {
            update().then(() => setLoading(false))
            if (paths.length > 1) {
                BackHandler.addEventListener(
                    "hardwareBackPress",
                    () => { back(); return true; })
            } else {
                BackHandler.addEventListener(
                    "hardwareBackPress",
                    () => { navigation.goBack(); return true; })
            }
        }
    })


    if (isLoading) {
        return <Loader />
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center" }}>
            <Text style={styles.title}>Select file</Text>
            <FlatList
                data={items}
                renderItem={
                    (item) =>
                        <DriveItemView
                            item={item.item}
                            onPress={() => item.item.id != BackItemId ? open(item.item.id, item.item.type) : back()}
                        />
                }
                keyExtractor={item => item.id}
                style={{ width: "90%", marginTop: 20 }}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    dividingLine: {
        alignSelf: 'center',
        width: '100%',
        height: 1,
        backgroundColor: '#cccccc'
    },
    title: {
        marginTop: 20,
        fontSize: 25,
        fontFamily: "Roboto-Regular",
        color: "#2AB2E2",
    },
    description: {
        width: '90%',
        marginTop: 40,
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        color: "#888888",
    }
});