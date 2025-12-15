import type {Request, RequestHandler, Response} from "express";
import "express-session";
import {StatusCodes} from "http-status-codes";
import path from "path";

import {bookingService} from "@/api/booking/bookingService";
import {ServiceResponse} from "@/common/models/serviceResponse";
import type {CreateMessageAttachmentData} from "@/api/booking/bookingRepository";

class BookingController {
    public getBookings: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const serviceResponse = await bookingService.getBookingsByUserId(req.session.userId);
        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public createBooking: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const {title, description, status = "Work Order", date} = req.body;

        const serviceResponse = await bookingService.createBooking(req.session.userId, {
            title,
            description,
            status,
            date,
        });
        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public getBookingById: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const bookingId = parseInt(req.params.id);
        const serviceResponse = await bookingService.getBookingById(bookingId, req.session.userId);
        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public getAttachment: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const bookingId = parseInt(req.params.bookingId);
        const attachmentId = parseInt(req.params.attachmentId);

        const serviceResponse = await bookingService.getAttachment(
            bookingId,
            attachmentId,
            req.session.userId
        );
        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public createMessage: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const bookingId = parseInt(req.params.id);
        const {content} = req.body;

        // Handle file attachments if present
        let attachments: CreateMessageAttachmentData[] | undefined;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            attachments = req.files.map((file: Express.Multer.File) => ({
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
            }));
        }

        const serviceResponse = await bookingService.createMessage(
            bookingId,
            req.session.userId,
            content,
            attachments
        );
        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public getMessageAttachment: RequestHandler = async (req: Request, res: Response) => {
        // Check if user is authenticated
        if (!req.session.userId) {
            const serviceResponse = ServiceResponse.failure(
                "Unauthorized. Please login first.",
                null,
                StatusCodes.UNAUTHORIZED
            );
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        const bookingId = parseInt(req.params.bookingId);
        const messageId = parseInt(req.params.messageId);
        const attachmentId = parseInt(req.params.attachmentId);

        const serviceResponse = await bookingService.getMessageAttachment(
            bookingId,
            messageId,
            attachmentId,
            req.session.userId
        );

        if (!serviceResponse.success || !serviceResponse.responseObject) {
            return res.status(serviceResponse.statusCode).send(serviceResponse);
        }

        // Send the file
        const attachment = serviceResponse.responseObject;
        res.sendFile(path.resolve(attachment.filePath), (err) => {
            if (err) {
                const errorResponse = ServiceResponse.failure(
                    "Error sending file",
                    null,
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
                res.status(errorResponse.statusCode).send(errorResponse);
            }
        });
    };
}

export const bookingController = new BookingController();

