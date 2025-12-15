import type {Request, RequestHandler, Response} from "express";
import "express-session";

import {loginService} from "@/api/login/loginService";

class LoginController {
    public login: RequestHandler = async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const serviceResponse = await loginService.login({
            email,
            password,
        });

        // If login successful, set up session
        if (serviceResponse.success && serviceResponse.responseObject) {
            req.session.userId = serviceResponse.responseObject.id;
            req.session.userEmail = serviceResponse.responseObject.email;
            req.session.userName = serviceResponse.responseObject.name;
            req.session.userPhoneNumber = serviceResponse.responseObject.phone_number;
        }

        res.status(serviceResponse.statusCode).send(serviceResponse);
    };

    public logout: RequestHandler = async (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed to logout",
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: "Logout successful",
                });
            }
        });
    };

    public checkSession: RequestHandler = async (req: Request, res: Response) => {
        if (req.session && req.session.userId) {
            res.status(200).send({
                success: true,
                message: "User is authenticated",
                responseObject: {
                    userName: req.session.userName,
                    userPhoneNumber: req.session.userPhoneNumber,
                    userId: req.session.userId,
                    userEmail: req.session.userEmail,
                },
            });
        } else {
            res.status(401).send({
                success: false,
                message: "User is not authenticated",
                responseObject: null,
            });
        }
    };
}

export const loginController = new LoginController();

