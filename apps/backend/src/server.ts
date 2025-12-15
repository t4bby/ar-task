import cors from "cors";
import express, {type Express} from "express";
import session from "express-session";
import helmet from "helmet";
import {pino} from "pino";
import {healthCheckRouter} from "@/api/healthCheck/healthCheckRouter";
import {openAPIRouter} from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import {env} from "@/common/utils/envConfig";
import {userRouter} from "@/api/user/userRouter";
import {registrationRouter} from "@/api/registration/registrationRouter";
import {loginRouter} from "@/api/login/loginRouter";
import {bookingRouter} from "@/api/booking/bookingRouter";

const logger = pino({name: "server start"});
const app: Express = express();

// Middlewares
app.set("trust proxy", 1); // Trust first proxy
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
}));
app.use(rateLimiter);

// Session configuration
app.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        name: "sessionId", // Custom cookie name
        cookie: {
            secure: env.NODE_ENV === "production", // Use secure cookies in production
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            sameSite: env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-origin in production
        },
    }),
);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/register", registrationRouter);
app.use("/login", loginRouter);
app.use("/bookings", bookingRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export {app, logger};