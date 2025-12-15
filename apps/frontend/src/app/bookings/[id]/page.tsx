'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getBookingById, createMessage, getMessageAttachment, type BookingWithDetails } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function BookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = parseInt(params.id as string);
    const { user, isLoading: authLoading, isAuthenticated } = useRequireAuth();
    const [booking, setBooking] = useState<BookingWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [messageContent, setMessageContent] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [messageError, setMessageError] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadBooking();
        }
    }, [authLoading, isAuthenticated, bookingId]);

    const loadBooking = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await getBookingById(bookingId);
            setBooking(response.responseObject);
        } catch (err: any) {
            setError(err.message || 'Failed to load booking details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim()) return;

        try {
            setIsSendingMessage(true);
            setMessageError('');
            const response = await createMessage(bookingId, messageContent, selectedFiles.length > 0 ? selectedFiles : undefined);

            // Add the new message to the booking
            if (booking && response.responseObject) {
                setBooking({
                    ...booking,
                    messages: [...booking.messages, response.responseObject],
                });
                setMessageContent('');
                setSelectedFiles([]);
            }
        } catch (err: any) {
            setMessageError(err.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(filesArray);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownloadAttachment = async (bookingId: number, messageId: number, attachmentId: number, fileName: string) => {
        try {
            const blob = await getMessageAttachment(bookingId, messageId, attachmentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error('Failed to download attachment:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

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
            <main className="container max-w-6xl mx-auto px-4">
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.push('/bookings')}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Bookings
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <Card className="shadow-2xl">
                        <CardHeader>
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                ) : !booking ? (
                    <Card className="shadow-2xl">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <p className="text-xl text-muted-foreground">Booking not found</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Booking Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-2xl">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-3xl font-bold">{booking.title}</CardTitle>
                                            <CardDescription className="text-base mt-2">
                                                Booking ID: #{booking.id}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(booking.status)} className="text-sm px-3 py-1">
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {booking.description && (
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                                            <p className="text-muted-foreground leading-relaxed">{booking.description}</p>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="font-semibold">{formatDate(booking.date)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="font-semibold">{formatDateTime(booking.createdAt)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Last Updated</p>
                                            <p className="font-semibold">{formatDateTime(booking.updatedAt)}</p>
                                        </div>
                                    </div>

                                    {booking.attachments.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h3 className="font-semibold text-lg mb-3">Attachments ({booking.attachments.length})</h3>
                                                <div className="space-y-2">
                                                    {booking.attachments.map((attachment) => (
                                                        <div
                                                            key={attachment.id}
                                                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                </svg>
                                                                <div>
                                                                    <p className="font-medium text-sm">{attachment.fileName}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline">{formatDateTime(attachment.createdAt)}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Messages Section */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-2xl h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Messages
                                    </CardTitle>
                                    <CardDescription>
                                        {booking.messages.length} {booking.messages.length === 1 ? 'message' : 'messages'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                                        {booking.messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-muted-foreground">No messages yet</p>
                                            </div>
                                        ) : (
                                            booking.messages.map((message) => (
                                                <div key={message.id} className="space-y-2">
                                                    <div
                                                        className={`p-3 rounded-lg ${
                                                            message.userId === user?.userId
                                                                ? 'bg-primary text-primary-foreground ml-4'
                                                                : 'bg-muted mr-4'
                                                        }`}
                                                    >
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                        <p className={`text-xs mt-2 ${
                                                            message.userId === user?.userId
                                                                ? 'text-primary-foreground/70'
                                                                : 'text-muted-foreground'
                                                        }`}>
                                                            {formatDateTime(message.createdAt)}
                                                        </p>
                                                    </div>
                                                    {message.messageAttachments && message.messageAttachments.length > 0 && (
                                                        <div className="space-y-1 px-2">
                                                            {message.messageAttachments.map((attachment) => (
                                                                <button
                                                                    key={attachment.id}
                                                                    onClick={() => handleDownloadAttachment(bookingId, message.id, attachment.id, attachment.fileName)}
                                                                    className="flex items-center gap-2 p-2 bg-secondary/50 hover:bg-secondary rounded text-xs w-full text-left"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                    </svg>
                                                                    <span className="truncate flex-1">{attachment.fileName}</span>
                                                                    <span className="text-muted-foreground">
                                                                        {formatFileSize(attachment.fileSize)}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <Separator className="my-4" />

                                    <form onSubmit={handleSendMessage} className="space-y-3">
                                        {messageError && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{messageError}</AlertDescription>
                                            </Alert>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Send a message</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Type your message here..."
                                                value={messageContent}
                                                onChange={(e) => setMessageContent(e.target.value)}
                                                disabled={isSendingMessage}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="files">Attach files (optional)</Label>
                                            <Input
                                                id="files"
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                disabled={isSendingMessage}
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                                                className="cursor-pointer"
                                            />
                                            {selectedFiles.length > 0 && (
                                                <div className="space-y-1 mt-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                                                            <span className="truncate flex-1">{file.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(index)}
                                                                    className="text-destructive hover:text-destructive/80"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={isSendingMessage || !messageContent.trim()} className="w-full">
                                            {isSendingMessage ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

