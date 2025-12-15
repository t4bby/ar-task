import type {Booking, BookingWithDetails, Attachment, Message, MessageWithAttachments, MessageAttachment} from "@/api/booking/bookingModel";
import {prisma} from "@/common/utils/database";

export interface CreateBookingData {
    userId: number;
    title: string;
    description?: string;
    status: string;
    date: Date;
}

export interface CreateMessageAttachmentData {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}

export class BookingRepository {
    async createAsync(data: CreateBookingData): Promise<Booking> {
        const booking = await prisma.booking.create({
            data: {
                userId: data.userId,
                title: data.title,
                description: data.description,
                status: data.status,
                date: data.date,
            },
        });

        return {
            id: booking.id,
            userId: booking.userId,
            title: booking.title,
            description: booking.description,
            status: booking.status,
            date: booking.date,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }

    async findAllByUserIdAsync(userId: number): Promise<Booking[]> {
        const bookings = await prisma.booking.findMany({
            where: {userId},
            orderBy: {createdAt: 'desc'},
        });

        return bookings.map(booking => ({
            id: booking.id,
            userId: booking.userId,
            title: booking.title,
            description: booking.description,
            status: booking.status,
            date: booking.date,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        }));
    }

    async findByIdAsync(id: number, userId: number): Promise<BookingWithDetails | null> {
        const booking = await prisma.booking.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                attachments: true,
                messages: {
                    include: {
                        messageAttachments: true,
                    },
                },
            },
        });

        if (!booking) return null;

        return {
            id: booking.id,
            userId: booking.userId,
            title: booking.title,
            description: booking.description,
            status: booking.status,
            date: booking.date,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            attachments: booking.attachments.map(att => ({
                id: att.id,
                bookingId: att.bookingId,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
                createdAt: att.createdAt,
            })),
            messages: booking.messages.map(msg => ({
                id: msg.id,
                bookingId: msg.bookingId,
                userId: msg.userId,
                content: msg.content,
                createdAt: msg.createdAt,
                messageAttachments: msg.messageAttachments.map(att => ({
                    id: att.id,
                    messageId: att.messageId,
                    fileName: att.fileName,
                    filePath: att.filePath,
                    fileSize: att.fileSize,
                    mimeType: att.mimeType,
                    createdAt: att.createdAt,
                })),
            })),
        };
    }

    async findAttachmentByIdAsync(
        bookingId: number,
        attachmentId: number,
        userId: number
    ): Promise<Attachment | null> {
        // First verify the booking belongs to the user
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
            },
        });

        if (!booking) return null;

        const attachment = await prisma.attachment.findFirst({
            where: {
                id: attachmentId,
                bookingId,
            },
        });

        if (!attachment) return null;

        return {
            id: attachment.id,
            bookingId: attachment.bookingId,
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            createdAt: attachment.createdAt,
        };
    }

    async createMessageAsync(
        bookingId: number,
        userId: number,
        content: string,
        attachments?: CreateMessageAttachmentData[]
    ): Promise<MessageWithAttachments | null> {
        // First verify the booking belongs to the user
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
            },
        });

        if (!booking) return null;

        const message = await prisma.message.create({
            data: {
                bookingId,
                userId,
                content,
                messageAttachments: attachments?.length ? {
                    create: attachments.map(att => ({
                        fileName: att.fileName,
                        filePath: att.filePath,
                        fileSize: att.fileSize,
                        mimeType: att.mimeType,
                    })),
                } : undefined,
            },
            include: {
                messageAttachments: true,
            },
        });

        return {
            id: message.id,
            bookingId: message.bookingId,
            userId: message.userId,
            content: message.content,
            createdAt: message.createdAt,
            messageAttachments: message.messageAttachments.map(att => ({
                id: att.id,
                messageId: att.messageId,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
                createdAt: att.createdAt,
            })),
        };
    }

    async findMessageAttachmentByIdAsync(
        bookingId: number,
        messageId: number,
        attachmentId: number,
        userId: number
    ): Promise<MessageAttachment | null> {
        // First verify the booking belongs to the user
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
            },
        });

        if (!booking) return null;

        // Verify the message belongs to the booking
        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                bookingId,
            },
        });

        if (!message) return null;

        // Get the attachment
        const attachment = await prisma.messageAttachment.findFirst({
            where: {
                id: attachmentId,
                messageId,
            },
        });

        if (!attachment) return null;

        return {
            id: attachment.id,
            messageId: attachment.messageId,
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            createdAt: attachment.createdAt,
        };
    }
}

