import type {User, UserWithPassword} from "@/api/user/userModel";
import {prisma} from "@/common/utils/database";

export class UserRepository {
    async findAllAsync(): Promise<User[]> {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return users.map(user => ({
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            phone_number: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }

    async findByIdAsync(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) return null;
        return {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            phone_number: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async findByEmailAsync(email: string): Promise<UserWithPassword | null> {
        const user = await prisma.user.findUnique({
            where: {email},
        });
        if (!user) return null;
        return {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            phone_number: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            password: user.password,
        };
    }

    async createAsync(user: {
        name: string;
        email: string;
        password: string;
        phone_number: string;
    }): Promise<User> {
        const newUser = await prisma.user.create({
            data: {
                uuid: crypto.randomUUID(),
                name: user.name,
                email: user.email,
                password: user.password,
                phoneNumber: user.phone_number,
            },
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return {
            id: newUser.id,
            uuid: newUser.uuid,
            name: newUser.name,
            email: newUser.email,
            phone_number: newUser.phoneNumber,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };
    }
}
