import type {Request, RequestHandler, Response} from "express";
import "express-session";

import {registrationService} from "@/api/registration/registrationService";

class RegistrationController {
    public register: RequestHandler = async (req: Request, res: Response) => {
        const {name, email, password, phone_number} = req.body;

        const serviceResponse = await registrationService.register({
            name,
            email,
            password,
            phone_number,
        });

        // If registration successful, set up session
        if (serviceResponse.success && serviceResponse.responseObject) {
            req.session.userId = serviceResponse.responseObject.id;
            req.session.userEmail = serviceResponse.responseObject.email;
        }

        res.status(serviceResponse.statusCode).send(serviceResponse);
    };
}

export const registrationController = new RegistrationController();

