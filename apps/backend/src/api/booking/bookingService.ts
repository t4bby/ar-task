import {StatusCodes} from "http-status-codes";

import type {Booking, BookingWithDetails, Attachment, Message, MessageWithAttachments, MessageAttachment} from "@/api/booking/bookingModel";
import {BookingRepository, CreateMessageAttachmentData} from "@/api/booking/bookingRepository";
import {ServiceResponse} from "@/common/models/serviceResponse";
import {logger} from "@/server";
import {serviceM8Service} from "@/common/utils/serviceM8Service";
import {UserRepository} from "@/api/user/userRepository";

export class BookingService {
    private bookingRepository: BookingRepository;
    private userRepository: UserRepository;

    constructor(
        repository: BookingRepository = new BookingRepository(),
        userRepo: UserRepository = new UserRepository()
    ) {
        this.bookingRepository = repository;
        this.userRepository = userRepo;
    }

    async getBookingsByUserId(userId: number): Promise<ServiceResponse<Booking[] | null>> {
        try {
            const bookings = await this.bookingRepository.findAllByUserIdAsync(userId);
            return ServiceResponse.success<Booking[]>(
                "Bookings retrieved successfully",
                bookings,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving bookings: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while retrieving bookings.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createBooking(
        userId: number,
        data: {
            title: string;
            description?: string;
            status: string;
            date: string;
        }
    ): Promise<ServiceResponse<Booking | null>> {
        try {
            // Get user to retrieve their ServiceM8 company UUID
            const user = await this.userRepository.findByIdAsync(userId);
            if (!user) {
                return ServiceResponse.failure(
                    "User not found",
                    null,
                    StatusCodes.NOT_FOUND,
                );
            }

            const bookingDate = new Date(data.date);

            // Create the booking first
            const booking = await this.bookingRepository.createAsync({
                userId,
                title: data.title,
                description: data.description,
                status: data.status,
                date: bookingDate,
            });

            // Create job in ServiceM8
            const serviceM8Job = await serviceM8Service.createJob({
                status: data.status,
                date: data.date,
                company_uuid: user.uuid,
            });

            if (serviceM8Job) {
                logger.info(`ServiceM8 job created for booking ${booking.id}`);
            } else {
                logger.warn(`Failed to create ServiceM8 job for booking ${booking.id}`);
            }

            return ServiceResponse.success<Booking>(
                "Booking created successfully",
                booking,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = `Error creating booking: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while creating the booking.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getBookingById(
        bookingId: number,
        userId: number
    ): Promise<ServiceResponse<BookingWithDetails | null>> {
        try {
            const booking = await this.bookingRepository.findByIdAsync(bookingId, userId);

            if (!booking) {
                return ServiceResponse.failure(
                    "Booking not found",
                    null,
                    StatusCodes.NOT_FOUND,
                );
            }

            return ServiceResponse.success<BookingWithDetails>(
                "Booking retrieved successfully",
                booking,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving booking: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while retrieving the booking.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getAttachment(
        bookingId: number,
        attachmentId: number,
        userId: number
    ): Promise<ServiceResponse<Attachment | null>> {
        try {
            const attachment = await this.bookingRepository.findAttachmentByIdAsync(
                bookingId,
                attachmentId,
                userId
            );

            if (!attachment) {
                return ServiceResponse.failure(
                    "Attachment not found",
                    null,
                    StatusCodes.NOT_FOUND,
                );
            }

            return ServiceResponse.success<Attachment>(
                "Attachment retrieved successfully",
                attachment,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving attachment: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while retrieving the attachment.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createMessage(
        bookingId: number,
        userId: number,
        content: string,
        attachments?: CreateMessageAttachmentData[]
    ): Promise<ServiceResponse<MessageWithAttachments | null>> {
        try {
            const message = await this.bookingRepository.createMessageAsync(
                bookingId,
                userId,
                content,
                attachments
            );

            if (!message) {
                return ServiceResponse.failure(
                    "Booking not found or you don't have permission to add messages",
                    null,
                    StatusCodes.NOT_FOUND,
                );
            }

            return ServiceResponse.success<MessageWithAttachments>(
                "Message created successfully",
                message,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = `Error creating message: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while creating the message.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getMessageAttachment(
        bookingId: number,
        messageId: number,
        attachmentId: number,
        userId: number
    ): Promise<ServiceResponse<MessageAttachment | null>> {
        try {
            const attachment = await this.bookingRepository.findMessageAttachmentByIdAsync(
                bookingId,
                messageId,
                attachmentId,
                userId
            );

            if (!attachment) {
                return ServiceResponse.failure(
                    "Message attachment not found",
                    null,
                    StatusCodes.NOT_FOUND,
                );
            }

            return ServiceResponse.success<MessageAttachment>(
                "Message attachment retrieved successfully",
                attachment,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving message attachment: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred while retrieving the message attachment.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export const bookingService = new BookingService();

