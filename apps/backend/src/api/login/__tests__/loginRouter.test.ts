import {StatusCodes} from "http-status-codes";
import request from "supertest";
import type {ServiceResponse} from "@/common/models/serviceResponse";
import {app} from "@/server";
import type {LoginResponse} from "@/api/login/loginModel";

describe("Login API Endpoints", () => {
    describe("POST /login", () => {
        it("should login successfully with valid credentials", async () => {
            // First create a user by registering
            await request(app).post("/register").send({
                name: "Test User",
                email: "test@example.com",
                phone_number: "1234567890",
                password: "password123",
            });

            // Now login
            const response = await request(app).post("/login").send({
                email: "test@example.com",
                password: "password123",
            });

            const result: ServiceResponse<LoginResponse> = response.body;

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(result.success).toBeTruthy();
            expect(result.message).toContain("Login successful");
            expect(result.responseObject).toHaveProperty("id");
            expect(result.responseObject).toHaveProperty("email", "test@example.com");
            expect(result.responseObject).not.toHaveProperty("password");
        });

        it("should fail login with invalid credentials", async () => {
            const response = await request(app).post("/login").send({
                email: "nonexistent@example.com",
                password: "wrongpassword",
            });

            const result: ServiceResponse = response.body;

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
            expect(result.success).toBeFalsy();
            expect(result.message).toContain("Invalid email or password");
        });

        it("should fail login with invalid email format", async () => {
            const response = await request(app).post("/login").send({
                email: "invalid-email",
                password: "password123",
            });

            const result: ServiceResponse = response.body;

            expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(result.success).toBeFalsy();
        });
    });

    describe("POST /login/logout", () => {
        it("should logout successfully", async () => {
            const response = await request(app).post("/login/logout");

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(response.body.success).toBeTruthy();
            expect(response.body.message).toContain("Logout successful");
        });
    });

    describe("GET /login/session", () => {
        it("should return session data when authenticated", async () => {
            const agent = request.agent(app);

            // Register and login to create session
            await agent.post("/register").send({
                name: "Session Test User",
                email: "session@example.com",
                phone_number: "1234567890",
                password: "password123",
            });

            await agent.post("/login").send({
                email: "session@example.com",
                password: "password123",
            });

            // Check session
            const response = await agent.get("/login/session");

            expect(response.statusCode).toEqual(StatusCodes.OK);
            expect(response.body.success).toBeTruthy();
            expect(response.body.responseObject).toHaveProperty("userId");
            expect(response.body.responseObject).toHaveProperty("userEmail", "session@example.com");
        });

        it("should return 401 when not authenticated", async () => {
            const response = await request(app).get("/login/session");

            expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
            expect(response.body.success).toBeFalsy();
            expect(response.body.message).toContain("not authenticated");
        });
    });
});

