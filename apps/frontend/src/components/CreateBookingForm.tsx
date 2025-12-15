'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export function CreateBookingForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Work Order',
        date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Convert date to ISO string
            const dateObj = new Date(formData.date);
            const isoDate = dateObj.toISOString();

            const response = await createBooking({
                title: formData.title,
                description: formData.description || undefined,
                status: formData.status,
                date: isoDate,
            });

            if (response.success) {
                // Navigate to the booking details page
                router.push(`/bookings/${response.responseObject?.id}`);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create booking');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Create New Booking</CardTitle>
                <CardDescription>Fill in the details to create a new booking</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Enter booking title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter booking description (optional)"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            disabled={isLoading}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: string) => handleChange('status', value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Work Order">Work Order</SelectItem>
                                <SelectItem value="Quote">Quote</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            min={today}
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Booking'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/bookings')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

