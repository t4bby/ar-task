import {z} from "zod";
import {extendZodWithOpenApi} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Login input schema
export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

// Login response schema
export const LoginResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    phone_number: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

