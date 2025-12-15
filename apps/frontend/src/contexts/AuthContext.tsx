'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, type SessionResponse, type RegisterData } from '@/lib/api';

interface AuthContextType {
    user: SessionResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await apiClient.checkSession();
            if (response.success && response.responseObject) {
                setUser(response.responseObject);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);

            if (response.success && response.responseObject) {
                // After successful login, check session to get user data
                await checkSession();
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiClient.register(data);

            if (response.success && response.responseObject) {
                // After successful registration, check session to get user data
                await checkSession();
                return { success: true, message: response.message };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'An error occurred during registration' };
        }
    };

    const logout = async () => {
        try {
            await apiClient.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear user on client side even if server request fails
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkSession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

