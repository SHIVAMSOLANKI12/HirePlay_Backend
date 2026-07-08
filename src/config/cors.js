import cors from "cors";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001"
];

const corsMiddleware = cors({
    origin(origin, callback) {

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    },

    credentials: true,
});

export default corsMiddleware;