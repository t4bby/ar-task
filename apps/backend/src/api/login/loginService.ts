import bcrypt from "bcryptjs";
import {StatusCodes} from "http-status-codes";

import type {LoginResponse} from "@/api/login/loginModel";
import {UserRepository} from "@/api/user/userRepository";
import {ServiceResponse} from "@/common/models/serviceResponse";
import {logger} from "@/server";

export class LoginService {
    private userRepository: UserRepository;

    constructor(repository: UserRepository = new UserRepository()) {
        this.userRepository = repository;
    }

    async login(data: {
        email: string;
        password: string;
    }): Promise<ServiceResponse<LoginResponse | null>> {
        try {
            // Find user by email
            const user = await this.userRepository.findByEmailAsync(data.email);

            if (!user) {
                return ServiceResponse.failure(
                    "Invalid email or password",
                    null,
                    StatusCodes.UNAUTHORIZED,
                );
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, user.password);

            if (!isPasswordValid) {
                return ServiceResponse.failure(
                    "Invalid email or password",
                    null,
                    StatusCodes.UNAUTHORIZED,
                );
            }

            // Return user data without password
            const loginResponse: LoginResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
            };

            return ServiceResponse.success<LoginResponse>(
                "Login successful",
                loginResponse,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error during login: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred during login.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export const loginService = new LoginService();

