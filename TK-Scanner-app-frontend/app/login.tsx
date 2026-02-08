import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TkLogo from '../components/TkLogo';
import { ApiClient } from '../lib/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await ApiClient.login(email, password);

            if (response.success && response.token) {
                await SecureStore.setItemAsync('auth_token', response.token);
                if (response.user) {
                    await SecureStore.setItemAsync('user_data', JSON.stringify(response.user));
                }
                router.replace('/scan');
            } else {
                setError(response.error || 'Login failed');
            }
        } catch (_) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="w-full max-w-sm bg-zinc-900 rounded-xl p-6 border border-zinc-800 self-center shadow-lg">
                    <View className="items-center mb-6">
                        <TkLogo width={128} height={128} />
                    </View>
                    <Text className="text-2xl font-bold text-white mb-6 text-center">Scanner Login</Text>

                    <View className="space-y-4 mb-4">
                        <View>
                            <Text className="text-zinc-400 mb-2 font-medium">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                                placeholder="volunteer@example.com"
                                placeholderTextColor="#71717a"
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <Text className="text-zinc-400 mb-2 font-medium">Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                                placeholder="••••••••"
                                placeholderTextColor="#71717a"
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {error && (
                        <View className="p-3 bg-red-900/30 border border-red-800 rounded-lg mb-4">
                            <Text className="text-red-200 text-sm text-center">{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className={`w-full py-4 rounded-lg flex-row justify-center items-center ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" className="mr-2" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setEmail('volunteer@example.com');
                            setPassword('password123');
                        }}
                        className="mt-4 py-2"
                    >
                        <Text className="text-zinc-500 text-center text-sm">Fill Test Credentials</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
