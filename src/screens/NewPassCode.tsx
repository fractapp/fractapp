import React, { useEffect, useState } from 'react';
import { showMessage } from "react-native-flash-message";
import { PassCode } from 'components'
import DB from 'utils/db';

export const NewPassCode = ({ navigation, route }: { navigation: any, route: any }) => {
    const [newPasscode, setNewPasscode] = useState<Array<number>>(new Array())
    const [description, setDescription] = useState<string>("Enter new passcode")
    const onSuccess = route.params.onSuccess
    
    const onSubmit = async (passcode: Array<number>) => {
        if (newPasscode.length == 0) {
            setNewPasscode(passcode)
            setDescription("Confirm new passcode")
        } else {
            let isEquals = true
            for (let i = 0; i < passcode.length; i++) {
                if (newPasscode[i] != passcode[i]) {
                    isEquals = false
                    break
                }
            }

            if (isEquals) {
                await DB.enablePasscode(passcode.join(""), false)
                navigation.goBack()
                onSuccess()
            } else {
                showMessage({
                    message: "Passcode not equals",
                    type: "danger",
                    icon: "warning"
                })
            }
        }
    }
    useEffect(() => {
    }, [])

    return (
        <PassCode isBiometry={false} description={description} onSubmit={onSubmit} />
    );
}