import {OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";
import express, {type Router} from "express";

import {UserSchema} from "@/api/user/userModel";
import {createApiResponse} from "@/api-docs/openAPIResponseBuilders";
import {validateRequest} from "@/common/utils/httpHandlers";
import {registrationController} from "./registrationController";
import {RegisterUserSchema} from "@/api/registration/registrationModel";

export const registrationRegistry = new OpenAPIRegistry();
export const registrationRouter: Router = express.Router();

registrationRegistry.registerPath({
    method: "post",
    path: "/register",
    tags: ["Registration"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: RegisterUserSchema.shape.body,
                },
            },
        },
    },
    responses: createApiResponse(UserSchema, "User registered successfully"),
});

registrationRouter.post("/", validateRequest(RegisterUserSchema), registrationController.register);

