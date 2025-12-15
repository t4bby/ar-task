/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public responseObject?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Helper function to handle API errors consistently
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Helper to check if response indicates authentication error
 */
export function isAuthError(statusCode?: number): boolean {
    return statusCode === 401 || statusCode === 403;
}

