import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export const Loader = () => {
    return (
        <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size={80} color="#2AB2E2" />
        </View>
    );
}