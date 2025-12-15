import {z} from "zod";
import {extendZodWithOpenApi} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Registration input schema
export const RegisterUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone_number: z.string().min(1, "Phone number is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
});