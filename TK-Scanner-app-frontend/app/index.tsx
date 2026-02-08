import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                setIsLoggedIn(!!token);
            } catch (e) {
                console.warn(e);
            } finally {
                setIsDataLoaded(true);
                // Hide splash screen after navigation decision is ready
                await SplashScreen.hideAsync();
            }
        }

        checkAuth();
    }, []);

    if (!isDataLoaded) {
        return null;
    }

    // If logged in, go to scan. Otherwise login.
    return <Redirect href={isLoggedIn ? "/scan" : "/login"} />;
}
