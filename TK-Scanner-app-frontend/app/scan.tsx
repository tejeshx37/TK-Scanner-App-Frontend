import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LogOut, RefreshCw } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import QRScanner from '../components/QRScanner';
import ScanResult from '../components/ScanResult';
import { ApiClient } from '../lib/api';
import { ScanResponse } from '../types';

export default function Scan() {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [lastScannedText, setLastScannedText] = useState<string | null>(null);
    const [scannerId, setScannerId] = useState<string>('unknown_device');

    useEffect(() => {
        async function checkAuth() {
            try {
                // Auth check
                const token = await SecureStore.getItemAsync('auth_token');
                if (!token) {
                    router.replace('/login');
                    return;
                }

                // Get user/scanner info
                const userData = await SecureStore.getItemAsync('user_data');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        setScannerId(user.id);
                    } catch (_) { }
                }
            } finally {
                setIsAuthChecked(true);
            }
        }

        checkAuth();
    }, [router]);

    const handleScan = useCallback(async (decodedText: string) => {
        if (loading || scanResult || !isScanning) return;

        setIsScanning(false);
        setLoading(true);
        setLastScannedText(decodedText);

        try {
            const response = await ApiClient.scan(decodedText, scannerId);
            setScanResult(response);
        } catch (_error) {
            setScanResult({ status: 'invalid', error: 'Scan failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    }, [loading, scanResult, isScanning, scannerId]);

    const handleReset = () => {
        setScanResult(null);
        setLastScannedText(null);
        setIsScanning(true);
    };

    const handleConfirm = async () => {
        const targetId = scanResult?.student?._id || lastScannedText;
        if (!targetId) return;
        setConfirming(true);

        try {
            const response = await ApiClient.confirmCheckIn(targetId);
            if (response.success) {
                handleReset();
            } else {
                Alert.alert('Error', response.error || 'Confirmation failed');
            }
        } catch (_) {
            Alert.alert('Error', 'Network error during confirmation');
        } finally {
            setConfirming(false);
        }
    };

    const handleConfirmMember = async (memberId: string) => {
        const targetId = scanResult?.student?._id || lastScannedText;
        if (!targetId) return;
        setConfirming(true);

        try {
            const response = await ApiClient.confirmCheckIn(targetId, memberId);
            if (response.success) {
                // Update local scanResult to show member as checked in
                if (scanResult?.student?.members) {
                    const updatedMembers = scanResult.student.members.map(m =>
                        m.memberId === memberId ? { ...m, checkedIn: true } : m
                    );
                    setScanResult({
                        ...scanResult,
                        student: {
                            ...scanResult.student,
                            members: updatedMembers
                        }
                    });
                }
            } else {
                Alert.alert('Error', response.error || 'Check-in failed');
            }
        } catch (_) {
            Alert.alert('Error', 'Network error during member check-in');
        } finally {
            setConfirming(false);
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        router.replace('/login');
    };

    // Don't render until auth is checked
    if (!isAuthChecked) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-zinc-900 bg-zinc-950">
                <Text className="text-xl font-bold text-blue-500">
                    TK <Text className="text-purple-500">Scanner</Text>
                </Text>
                <TouchableOpacity
                    onPress={handleLogout}
                    className="p-2 bg-zinc-900 rounded-full"
                >
                    <LogOut size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View className="flex-1 p-4 relative">
                <View className="flex-1 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner">
                    <QRScanner
                        onScanSuccess={handleScan}
                        isScanning={isScanning && !loading && !scanResult}
                    />

                    {loading && (
                        <View className="absolute inset-0 bg-black/60 items-center justify-center backdrop-blur-sm">
                            <RefreshCw className="animate-spin text-blue-500 mb-4" size={48} />
                            <Text className="text-white font-medium">Verifying...</Text>
                        </View>
                    )}
                </View>

                <View className="mt-4 items-center">
                    <Text className="text-zinc-500 text-sm">
                        {isScanning ? 'Point camera at QR code' : 'Processing result...'}
                    </Text>
                </View>
            </View>

            {/* Result Modal - Overlay */}
            {scanResult && (
                <View className="absolute inset-0 z-50">
                    <ScanResult
                        result={scanResult}
                        onReset={handleReset}
                        onConfirm={handleConfirm}
                        onConfirmMember={handleConfirmMember}
                        isConfirming={confirming}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
