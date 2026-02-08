import { AuthResponse, ConfirmResponse, ScanResponse } from '@/types';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-backend.render.com';

// Mock data for development/testing when no backend is available
const MOCK_TOKEN = 'mock-jwt-token-123';
const MOCK_USER = { id: 'user-1', name: 'Test Volunteer', email: 'volunteer@example.com' };

export class ApiClient {
    private static async getToken(): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync('auth_token');
        } catch (e) {
            return null;
        }
    }

    private static async getHeaders(authenticated: boolean = true): Promise<HeadersInit> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true', // Lowercase is safer for some proxies
            'User-Agent': 'TKScannerApp/1.0',
        };
        if (authenticated) {
            const token = await this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    static async login(email: string, password: string): Promise<AuthResponse> {

        try {
            const headers = await this.getHeaders(false);
            const url = `${API_BASE_URL}/api/auth/login`;
            console.log(`Attempting login at: ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Login failed with status ${response.status}:`, errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    return { success: false, error: errorData.error || `Error ${response.status}` };
                } catch (e) {
                    return { success: false, error: `Server error: ${response.status}` };
                }
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error('Login error detailed:', error);
            return { success: false, error: `Connection failed: ${error.message || 'unknown'}` };
        }
    }

    static async scan(ticketData: string | any, scannerId: string): Promise<ScanResponse> {
        let passId = ticketData;
        let userId = '';
        let passType = '';
        let ticketToken = '';

        // Check if input is a JSON string or object
        try {
            const parsedData = typeof ticketData === 'string' ? JSON.parse(ticketData) : ticketData;
            if (parsedData.passId) {
                passId = parsedData.passId;
                userId = parsedData.userId;
                passType = parsedData.passType;
                ticketToken = parsedData.token;
            }
        } catch (e) {
            // Not a JSON string, treat as raw passId
            console.log('Scanned data is not JSON, using as raw ID');
        }

        try {
            const url = `${API_BASE_URL}/api/scan`;
            console.log(`Calling API: ${url} for pass: ${passId}`);

            const headers = await this.getHeaders(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ passId, userId, passType, token: ticketToken, scannerId }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Scan failed: HTTP ${response.status}`, errorBody);
                try {
                    const data = JSON.parse(errorBody);
                    if (data && data.status) return data;
                } catch (e) {
                    console.error('Failed to parse error response JSON');
                }
                return { status: 'invalid', error: `Server error (v2: ${response.status})` };
            }

            return await response.json();
        } catch (error: any) {
            console.error('Scan request error:', error);
            if (error.name === 'AbortError') {
                return { status: 'invalid', error: 'Request timed out. Is the server running?' };
            }
            return { status: 'invalid', error: `Network error: ${error.message || 'Unknown'}` };
        }
    }

    static async confirmCheckIn(passId: string, memberId?: string): Promise<ConfirmResponse> {

        try {
            const headers = await this.getHeaders(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch(`${API_BASE_URL}/api/scan/confirm`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ passId, memberId }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                return { success: false, error: data.error || 'Confirmation failed' };
            }

            return await response.json();
        } catch (error: any) {
            console.error('Confirm error:', error);
            if (error.name === 'AbortError') {
                return { success: false, error: 'Request timed out' };
            }
            return { success: false, error: 'Network error' };
        }
    }
}
