import bcrypt from "bcryptjs";
import {StatusCodes} from "http-status-codes";

import type {User} from "@/api/user/userModel";
import {UserRepository} from "@/api/user/userRepository";
import {ServiceResponse} from "@/common/models/serviceResponse";
import {logger} from "@/server";
import {serviceM8Service} from "@/common/utils/serviceM8Service";

export class RegistrationService {
    private userRepository: UserRepository;

    constructor(repository: UserRepository = new UserRepository()) {
        this.userRepository = repository;
    }

    async register(data: {
        name: string;
        email: string;
        password: string;
        phone_number: string;
    }): Promise<ServiceResponse<User | null>> {
        try {

            // Check if user already exists
            const existingUser = await this.userRepository.findByEmailAsync(data.email);
            if (existingUser) {
                return ServiceResponse.failure(
                    "User with this email already exists",
                    null,
                    StatusCodes.CONFLICT,
                );
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);

            // Create user
            const user = await this.userRepository.createAsync({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone_number: data.phone_number,
            });

            const serviceM8Company = await serviceM8Service.createClient({
                name: data.name,
                uuid: user.uuid
            });

            if (serviceM8Company) {
                logger.info(`ServiceM8 company created for user: ${user.email}`);
            } else {
                logger.warn(`Failed to create ServiceM8 company for user: ${user.email}`);
            }

            return ServiceResponse.success<User>("User registered successfully", user, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error during registration: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure(
                "An error occurred during registration.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

export const registrationService = new RegistrationService();

