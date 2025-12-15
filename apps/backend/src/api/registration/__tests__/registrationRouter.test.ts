import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/userModel";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import { prisma } from "@/common/utils/database";

describe("Registration API Endpoints", () => {
	beforeEach(async () => {
		// Clear users table before each test
		await prisma.user.deleteMany();
	});

	afterAll(async () => {
		// Clean up
		await prisma.user.deleteMany();
		await prisma.$disconnect();
	});

	describe("POST /register", () => {
		it("should register a new user successfully", async () => {
			// Arrange
			const newUser = {
				name: "John Doe",
				email: "john@example.com",
				password: "password123",
				phone_number: "0987654321",
			};

			// Act
			const response = await request(app).post("/register").send(newUser);
			const responseBody: ServiceResponse<User> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.CREATED);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("registered successfully");
			expect(responseBody.responseObject).toBeDefined();
			expect(responseBody.responseObject?.name).toEqual(newUser.name);
			expect(responseBody.responseObject?.email).toEqual(newUser.email);
			expect(responseBody.responseObject?.phone_number).toEqual(newUser.phone_number);
			expect(responseBody.responseObject?.id).toBeDefined();
		});

		it("should not register user with duplicate email", async () => {
			// Arrange
			const newUser = {
				name: "Jane Doe",
				email: "jane@example.com",
				password: "password123",
				phone_number: "0987654321",
			};

			// First registration
			await request(app).post("/register").send(newUser);

			// Act - Try to register again with same email
			const response = await request(app).post("/register").send(newUser);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.CONFLICT);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("already exists");
		});

		it("should return bad request for invalid email", async () => {
			// Arrange
			const invalidUser = {
				name: "Test User",
				email: "not-an-email",
				password: "password123",
				phone_number: "0987654321",
			};

			// Act
			const response = await request(app).post("/register").send(invalidUser);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
		});

		it("should return bad request for short password", async () => {
			// Arrange
			const invalidUser = {
				name: "Test User",
				email: "test@example.com",
				password: "123",
				phone_number: "1234567890",
			};

			// Act
			const response = await request(app).post("/register").send(invalidUser);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
		});

		it("should return bad request for missing required fields", async () => {
			// Arrange
			const invalidUser = {
				name: "Test User",
				// missing email and password
			};

			// Act
			const response = await request(app).post("/register").send(invalidUser);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
		});
	});
});

