import type {Request, Response, NextFunction} from "express";
import {StatusCodes} from "http-status-codes";

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userId) {
        // User is authenticated
        next();
    } else {
        // User is not authenticated
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Authentication required",
        });
    }
};

/**
 * Middleware to attach user info to response if authenticated
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    // Just continue - user may or may not be authenticated
    next();
};

