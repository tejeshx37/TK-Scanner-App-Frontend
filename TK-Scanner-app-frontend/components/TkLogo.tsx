import React from 'react';
import { View } from 'react-native';
import Logo from '../assets/images/logo.svg';

interface TkLogoProps {
    width?: number;
    height?: number;
    className?: string; // For NativeWind
}

export default function TkLogo({ width = 120, height = 120, className }: TkLogoProps) {
    return (
        <View className={className}>
            <Logo width={width} height={height} />
        </View>
    );
}
