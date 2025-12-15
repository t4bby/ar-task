import {extendZodWithOpenApi} from "@asteasolutions/zod-to-openapi";
import {z} from "zod";

import {commonValidations} from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Booking schema
export type Booking = z.infer<typeof BookingSchema>;
export const BookingSchema = z.object({
    id: z.number(),
    userId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    date: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Attachment schema
export type Attachment = z.infer<typeof AttachmentSchema>;
export const AttachmentSchema = z.object({
    id: z.number(),
    bookingId: z.number(),
    fileName: z.string(),
    filePath: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    createdAt: z.date(),
});

// Message schema
export type Message = z.infer<typeof MessageSchema>;
export const MessageSchema = z.object({
    id: z.number(),
    bookingId: z.number(),
    userId: z.number(),
    content: z.string(),
    createdAt: z.date(),
});

// MessageAttachment schema
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;
export const MessageAttachmentSchema = z.object({
    id: z.number(),
    messageId: z.number(),
    fileName: z.string(),
    filePath: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    createdAt: z.date(),
});

// Message with attachments
export type MessageWithAttachments = z.infer<typeof MessageWithAttachmentsSchema>;
export const MessageWithAttachmentsSchema = MessageSchema.extend({
    messageAttachments: z.array(MessageAttachmentSchema),
});

// Booking with relations
export type BookingWithDetails = z.infer<typeof BookingWithDetailsSchema>;
export const BookingWithDetailsSchema = BookingSchema.extend({
    attachments: z.array(AttachmentSchema),
    messages: z.array(MessageWithAttachmentsSchema),
});

// Input Validation for 'GET bookings/:id' endpoint
export const GetBookingSchema = z.object({
    params: z.object({id: commonValidations.id}),
});

// Input Validation for 'POST bookings' endpoint
export const CreateBookingSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        status: z.string().default("Work Order"),
        date: z.string().datetime("Date must be a valid ISO datetime"),
    }),
});

// Input Validation for 'POST bookings/:id/messages' endpoint
export const CreateMessageSchema = z.object({
    params: z.object({id: commonValidations.id}),
    body: z.object({
        content: z.string().min(1, "Message content is required"),
    }),
});

// Input Validation for 'GET bookings/:bookingId/attachments/:attachmentId' endpoint
export const GetAttachmentSchema = z.object({
    params: z.object({
        bookingId: commonValidations.id,
        attachmentId: commonValidations.id,
    }),
});

