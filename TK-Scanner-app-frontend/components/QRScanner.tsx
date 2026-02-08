import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QRScannerProps {
    onScanSuccess: (data: string) => void;
    isScanning: boolean;
}

export default function QRScanner({ onScanSuccess, isScanning }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [isMounting, setIsMounting] = useState(true);

    useEffect(() => {
        setIsMounting(false);
    }, []);

    if (isMounting) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator color="#3b82f6" />
            </View>
        );
    }

    if (!permission) {
        // Camera permissions are still loading
        return <View className="flex-1 bg-black" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-black p-6">
                <Camera size={48} color="#6b7280" className="mb-4" />
                <Text className="text-white text-xl font-bold mb-2 text-center">Camera Access Required</Text>
                <Text className="text-zinc-400 text-center mb-6">We need permission to access your camera to scan QR codes.</Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center gap-2"
                >
                    <RefreshCw size={20} color="white" />
                    <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black rounded-lg overflow-hidden relative">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={isScanning ? ({ data }) => {
                    // Only trigger if scanning is allowed
                    if (data) onScanSuccess(data);
                } : undefined}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* Overlay Guide */}
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="w-64 h-64 border-2 border-white/50 rounded-xl relative bg-transparent">
                        <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                        <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

                        {isScanning && (
                            <View className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-xl" />
                        )}
                    </View>
                    <Text className="text-white/80 mt-8 font-medium bg-black/60 px-4 py-2 rounded-full overflow-hidden">
                        Align QR code within frame
                    </Text>
                </View>
            </CameraView>
        </View>
    );
}
