import React, { useEffect, useState } from 'react';
import { showMessage } from "react-native-flash-message";
import { PassCode } from 'components'
import DB from 'utils/db';
import PasscodeUtil from 'utils/passcode';

export const VerifyPassCode = ({ navigation, route }: { navigation: any, route: any }) => {
    const [isBiometry, setBiometry] = useState<Boolean>()
    const onSuccess = route.params.onSuccess
    const routeName = route.params.routeName
    const isGoBack = route.params.isGoBack

    const onSubmit = async (passcode: Array<number>) => {
        let hash = await DB.getPasscodeHash()
        if (hash == PasscodeUtil.hash(passcode.join(""), await DB.getSalt())) {
            onSuccess(passcode.join(""))
            if (isGoBack) {
                navigation.goBack()
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: routeName }],
                })
            }
        } else {
            showMessage({
                message: "Incorrect passcode",
                type: "danger",
                icon: "warning"
            })
        }
    }

    useEffect(() => {
        (async () => {
            setBiometry(await DB.isBiometry())
        })()
    }, [])

    return (
        <PassCode isBiometry={isBiometry} description={"Enter passcode"} onSubmit={onSubmit} />
    );
}