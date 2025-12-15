import {OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";
import express, {type Router} from "express";

import {
    BookingSchema,
    BookingWithDetailsSchema,
    AttachmentSchema,
    MessageWithAttachmentsSchema,
    MessageAttachmentSchema,
    GetBookingSchema,
    GetAttachmentSchema,
    CreateMessageSchema, CreateBookingSchema,
} from "@/api/booking/bookingModel";
import {createApiResponse} from "@/api-docs/openAPIResponseBuilders";
import {validateRequest} from "@/common/utils/httpHandlers";
import {bookingController} from "./bookingController";
import {z} from "zod";
import {upload} from "@/common/utils/uploadConfig";

export const bookingRegistry = new OpenAPIRegistry();
export const bookingRouter: Router = express.Router();

// Register OpenAPI paths

// GET /bookings - Get list of user's bookings
bookingRegistry.registerPath({
    method: "get",
    path: "/bookings",
    tags: ["Bookings"],
    responses: createApiResponse(z.array(BookingSchema), "Bookings retrieved successfully"),
});

// GET /bookings/:id - Get specific booking details
bookingRegistry.registerPath({
    method: "get",
    path: "/bookings/{id}",
    tags: ["Bookings"],
    request: {
        params: GetBookingSchema.shape.params,
    },
    responses: createApiResponse(BookingWithDetailsSchema, "Booking details retrieved successfully"),
});

// GET /bookings/:bookingId/attachments/:attachmentId - Get attachment details
bookingRegistry.registerPath({
    method: "get",
    path: "/bookings/{bookingId}/attachments/{attachmentId}",
    tags: ["Bookings"],
    request: {
        params: GetAttachmentSchema.shape.params,
    },
    responses: createApiResponse(AttachmentSchema, "Attachment retrieved successfully"),
});

// POST /bookings/:id/messages - Send a message for a booking
bookingRegistry.registerPath({
    method: "post",
    path: "/bookings/{id}/messages",
    tags: ["Bookings"],
    request: {
        params: CreateMessageSchema.shape.params,
        body: {
            content: {
                "multipart/form-data": {
                    schema: CreateMessageSchema.shape.body,
                },
            },
        },
    },
    responses: createApiResponse(MessageWithAttachmentsSchema, "Message created successfully"),
});

// GET /bookings/:bookingId/messages/:messageId/attachments/:attachmentId - Download message attachment
bookingRegistry.registerPath({
    method: "get",
    path: "/bookings/{bookingId}/messages/{messageId}/attachments/{attachmentId}",
    tags: ["Bookings"],
    request: {
        params: z.object({
            bookingId: z.number(),
            messageId: z.number(),
            attachmentId: z.number(),
        }),
    },
    responses: createApiResponse(MessageAttachmentSchema, "Message attachment retrieved successfully"),
});

// Define routes
bookingRouter.get("/", bookingController.getBookings);
bookingRouter.post("/", validateRequest(CreateBookingSchema), bookingController.createBooking);
bookingRouter.get("/:id", validateRequest(GetBookingSchema), bookingController.getBookingById);
bookingRouter.get(
    "/:bookingId/attachments/:attachmentId",
    validateRequest(GetAttachmentSchema),
    bookingController.getAttachment
);
bookingRouter.post(
    "/:id/messages",
    upload.array('files', 5), // Allow up to 5 files
    bookingController.createMessage
);
bookingRouter.get(
    "/:bookingId/messages/:messageId/attachments/:attachmentId",
    bookingController.getMessageAttachment
);

