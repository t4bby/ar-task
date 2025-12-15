'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { CreateBookingForm } from '@/components/CreateBookingForm';

export default function NewBookingPage() {
    const { isLoading: authLoading, isAuthenticated } = useRequireAuth();

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8">
            <main className="container max-w-2xl mx-auto px-4">
                <CreateBookingForm />
            </main>
        </div>
    );
}

