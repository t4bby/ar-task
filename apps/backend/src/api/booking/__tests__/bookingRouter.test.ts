import {StatusCodes} from "http-status-codes";
import request from "supertest";
import type {ServiceResponse} from "@/common/models/serviceResponse";
import {app} from "@/server";
import type {Booking, BookingWithDetails, Message} from "@/api/booking/bookingModel";
import {prisma} from "@/common/utils/database";

describe("Booking API Endpoints", () => {
    let authCookie: string;
    let userId: number;
    let bookingId: number;

    beforeAll(async () => {
        // Clean up any existing test user
        await prisma.user.deleteMany({
            where: { email: "booking@example.com" }
        });

        // Register and login a user
        const registerResponse = await request(app).post("/register").send({
            name: "Booking Test User",
            email: "booking@example.com",
            phone_number: "9876543210",
            password: "password123",
        });

        if (!registerResponse.body.responseObject) {
            throw new Error(`Registration failed: ${registerResponse.body.message}`);
        }

        userId = registerResponse.body.responseObject.id;

        const loginResponse = await request(app).post("/login").send({
            email: "booking@example.com",
            password: "password123",
        });
        authCookie = loginResponse.headers["set-cookie"];

        // Verify user exists in database
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            throw new Error(`User not found in database after registration. UserId: ${userId}`);
        }

        // Create a test booking via API
        const bookingResponse = await request(app)
            .post("/bookings")
            .set("Cookie", authCookie)
            .send({
                title: "Test Booking",
                description: "This is a test booking",
                status: "pending",
                date: new Date("2025-01-01").toISOString(),
            });

        bookingId = bookingResponse.body.responseObject.id;

        // Create a test attachment
        await prisma.attachment.create({
            data: {
                bookingId,
                fileName: "test.pdf",
                filePath: "/uploads/test.pdf",
                fileSize: 1024,
                mimeType: "application/pdf",
            },
        });
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: { email: "booking@example.com" }
        });
        await prisma.$disconnect();
    });

    describe("POST /bookings", () => {
        it("should create a new booking", async () => {
            const response = await request(app)
                .post("/bookings")
                .set("Cookie", authCookie)
                .send({
                    title: "New Test Booking",
                    description: "This is a new booking created via API",
                    status: "pending",
                    date: new Date("2025-02-15").toISOString(),
                });

            const result: ServiceResponse<Booking> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.CREATED);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toHaveProperty("id");
            expect(result.responseObject).toHaveProperty("title", "New Test Booking");
            expect(result.responseObject).toHaveProperty("description", "This is a new booking created via API");
            expect(result.responseObject).toHaveProperty("status", "pending");
            expect(result.responseObject).toHaveProperty("userId", userId);
        });

        it("should create a booking with default status when not provided", async () => {
            const response = await request(app)
                .post("/bookings")
                .set("Cookie", authCookie)
                .send({
                    title: "Booking with Default Status",
                    date: new Date("2025-03-01").toISOString(),
                });

            const result: ServiceResponse<Booking> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.CREATED);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toHaveProperty("status", "Work Order");
        });

        it("should fail when title is missing", async () => {
            const response = await request(app)
                .post("/bookings")
                .set("Cookie", authCookie)
                .send({
                    description: "Missing title",
                    date: new Date("2025-02-15").toISOString(),
                });

            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it("should fail when date is invalid", async () => {
            const response = await request(app)
                .post("/bookings")
                .set("Cookie", authCookie)
                .send({
                    title: "Invalid Date Booking",
                    date: "not-a-valid-date",
                });

            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post("/bookings")
                .send({
                    title: "Unauthorized Booking",
                    date: new Date("2025-02-15").toISOString(),
                });

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });

    describe("GET /bookings", () => {
        it("should return list of user bookings", async () => {
            const response = await request(app)
                .get("/bookings")
                .set("Cookie", authCookie);

            const result: ServiceResponse<Booking[]> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toBeInstanceOf(Array);
            expect(result.responseObject.length).toBeGreaterThan(0);
        });

        it("should fail without authentication", async () => {
            const response = await request(app).get("/bookings");

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });

    describe("GET /bookings/:id", () => {
        it("should return booking details with attachments and messages", async () => {
            const response = await request(app)
                .get(`/bookings/${bookingId}`)
                .set("Cookie", authCookie);

            const result: ServiceResponse<BookingWithDetails> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toHaveProperty("id", bookingId);
            expect(result.responseObject).toHaveProperty("title", "Test Booking");
            expect(result.responseObject).toHaveProperty("attachments");
            expect(result.responseObject).toHaveProperty("messages");
            expect(result.responseObject.attachments.length).toBeGreaterThan(0);
        });

        it("should fail for non-existent booking", async () => {
            const response = await request(app)
                .get("/bookings/99999")
                .set("Cookie", authCookie);

            expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
        });

        it("should fail without authentication", async () => {
            const response = await request(app).get(`/bookings/${bookingId}`);

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });

    describe("POST /bookings/:id/messages", () => {
        it("should create a message for booking", async () => {
            const response = await request(app)
                .post(`/bookings/${bookingId}/messages`)
                .set("Cookie", authCookie)
                .send({
                    content: "This is a test message",
                });

            const result: ServiceResponse<Message> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.CREATED);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toHaveProperty("content", "This is a test message");
            expect(result.responseObject).toHaveProperty("bookingId", bookingId);
        });

        it("should fail with empty content", async () => {
            const response = await request(app)
                .post(`/bookings/${bookingId}/messages`)
                .set("Cookie", authCookie)
                .send({
                    content: "",
                });

            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post(`/bookings/${bookingId}/messages`)
                .send({
                    content: "This should fail",
                });

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });

    describe("GET /bookings/:bookingId/attachments/:attachmentId", () => {
        it("should return attachment details", async () => {
            const attachments = await prisma.attachment.findMany({
                where: {bookingId},
            });
            const attachmentId = attachments[0].id;

            const response = await request(app)
                .get(`/bookings/${bookingId}/attachments/${attachmentId}`)
                .set("Cookie", authCookie);

            const result: ServiceResponse = response.body;

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(result.success).toBeTruthy();
            expect(result.responseObject).toHaveProperty("fileName", "test.pdf");
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .get(`/bookings/${bookingId}/attachments/1`);

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
        });
    });
});

