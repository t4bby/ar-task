// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

import axios, {AxiosRequestConfig} from 'axios';
import {ApiError} from './errors';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    responseObject: T | null;
    statusCode?: number;
}

export interface LoginResponse {
    id: number;
    name: string;
    email: string;
    phone_number: string;
}

export interface SessionResponse {
    userId: number;
    userName: string;
    userPhoneNumber: string;
    userEmail: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone_number: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    status: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export interface Attachment {
    id: number;
    bookingId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
}

export interface Message {
    id: number;
    bookingId: number;
    userId: number;
    content: string;
    createdAt: string;
}

export interface MessageAttachment {
    id: number;
    messageId: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
}

export interface MessageWithAttachments extends Message {
    messageAttachments: MessageAttachment[];
}

export interface BookingWithDetails extends Booking {
    attachments: Attachment[];
    messages: MessageWithAttachments[];
}

class ApiClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: AxiosRequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await axios({
                url,
                ...options,
                withCredentials: true, // Important for cookies/sessions
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data: ApiResponse<T> = response.data;

            // Check if the API response indicates failure
            if (!data.success) {
                return Promise.reject(new ApiError(
                    data.message || 'An error occurred',
                    data.statusCode || response.status,
                    data.responseObject
                ));
            }

            return data;
        } catch (error) {
            // Re-throw if it's already an ApiError (from the success check above)
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle axios errors
            if (axios.isAxiosError(error) && error.response) {
                const data: ApiResponse<T> = error.response.data;
                throw new ApiError(
                    data.message || 'An error occurred',
                    data.statusCode || error.response.status,
                    data.responseObject
                );
            }

            // Handle unexpected errors
            throw new ApiError('An unexpected error occurred');
        }
    }

    // Authentication endpoints
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        return this.request<LoginResponse>('/login', {
            method: 'POST',
            data: {email, password},
        });
    }

    async register(data: RegisterData): Promise<ApiResponse<User>> {
        return this.request<User>('/register', {
            method: 'POST',
            data: data,
        });
    }

    async logout(): Promise<ApiResponse<null>> {
        return this.request<null>('/login/logout', {
            method: 'POST',
        });
    }

    async checkSession(): Promise<ApiResponse<SessionResponse>> {
        return this.request<SessionResponse>('/login/session', {
            method: 'GET',
        });
    }

    // Booking endpoints
    async getBookings(): Promise<ApiResponse<Booking[]>> {
        return this.request<Booking[]>('/bookings', {
            method: 'GET',
        });
    }

    async getBookingById(id: number): Promise<ApiResponse<BookingWithDetails>> {
        return this.request<BookingWithDetails>(`/bookings/${id}`, {
            method: 'GET',
        });
    }

    async createBooking(data: {
        title: string;
        description?: string;
        status?: string;
        date: string;
    }): Promise<ApiResponse<Booking>> {
        return this.request<Booking>('/bookings', {
            method: 'POST',
            data,
        });
    }

    async createMessage(bookingId: number, content: string, files?: File[]): Promise<ApiResponse<MessageWithAttachments>> {
        const formData = new FormData();
        formData.append('content', content);

        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file);
            });
        }

        return this.request<MessageWithAttachments>(`/bookings/${bookingId}/messages`, {
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async getMessageAttachment(bookingId: number, messageId: number, attachmentId: number): Promise<Blob> {
        const url = `${this.baseUrl}/bookings/${bookingId}/messages/${messageId}/attachments/${attachmentId}`;

        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new ApiError(
                    'Failed to download attachment',
                    error.response.status
                );
            }
            throw new ApiError('An unexpected error occurred');
        }
    }

    async getAttachment(bookingId: number, attachmentId: number): Promise<ApiResponse<Attachment>> {
        return this.request<Attachment>(`/bookings/${bookingId}/attachments/${attachmentId}`, {
            method: 'GET',
        });
    }
}

export const apiClient = new ApiClient();

// Convenience exports
export const login = (email: string, password: string) => apiClient.login(email, password);
export const register = (data: RegisterData) => apiClient.register(data);
export const logout = () => apiClient.logout();
export const checkSession = () => apiClient.checkSession();
export const getBookings = () => apiClient.getBookings();
export const getBookingById = (id: number) => apiClient.getBookingById(id);
export const createBooking = (data: {
    title: string;
    description?: string;
    status?: string;
    date: string
}) => apiClient.createBooking(data);
export const createMessage = (bookingId: number, content: string, files?: File[]) => apiClient.createMessage(bookingId, content, files);
export const getAttachment = (bookingId: number, attachmentId: number) => apiClient.getAttachment(bookingId, attachmentId);
export const getMessageAttachment = (bookingId: number, messageId: number, attachmentId: number) => apiClient.getMessageAttachment(bookingId, messageId, attachmentId);
