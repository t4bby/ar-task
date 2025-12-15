import {OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";
import express, {type Router} from "express";
import {z} from "zod";

import {LoginResponseSchema, LoginSchema} from "@/api/login/loginModel";
import {createApiResponse} from "@/api-docs/openAPIResponseBuilders";
import {validateRequest} from "@/common/utils/httpHandlers";
import {loginController} from "./loginController";

export const loginRegistry = new OpenAPIRegistry();
export const loginRouter: Router = express.Router();

loginRegistry.registerPath({
    method: "post",
    path: "/login",
    tags: ["Authentication"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: LoginSchema.shape.body,
                },
            },
        },
    },
    responses: createApiResponse(LoginResponseSchema, "Login successful"),
});

loginRegistry.registerPath({
    method: "post",
    path: "/logout",
    tags: ["Authentication"],
    responses: createApiResponse(z.null(), "Logout successful"),
});

loginRegistry.registerPath({
    method: "get",
    path: "/session",
    tags: ["Authentication"],
    responses: createApiResponse(z.object({
        userName: z.string(),
        userPhoneNumber: z.string(),
        userId: z.number(),
        userEmail: z.string().email(),
    }), "Session check"),
});

loginRouter.post("/", validateRequest(LoginSchema), loginController.login);
loginRouter.post("/logout", loginController.logout);
loginRouter.get("/session", loginController.checkSession);

