'use client';

import {useAuth} from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import Link from 'next/link';

export default function Home() {
    const {user, isLoading, isAuthenticated, logout} = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <main className="w-full max-w-3xl px-4 py-8">
                {isAuthenticated ? (
                    <Card className="shadow-2xl">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-3xl font-bold">AR Task</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className="p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm">Name</Badge>
                                        <span className="font-semibold">{user?.userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm">Phone Number</Badge>
                                        <span className="font-semibold">{user?.userPhoneNumber}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm">Email</Badge>
                                        <span className="font-semibold">{user?.userEmail}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button asChild className="flex-1" size="lg">
                                    <Link href="/bookings">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        My Bookings
                                    </Link>
                                </Button>
                            </div>

                            <Button
                                onClick={logout}
                                variant="destructive"
                                className="w-full"
                                size="lg"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <LoginForm/>
                )}
            </main>
        </div>
    );
}
