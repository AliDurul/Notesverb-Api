"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.asyncHandler = asyncHandler;
exports.validateRequest = validateRequest;
exports.errorHandler = errorHandler;
exports.corsOptions = corsOptions;
exports.healthCheck = healthCheck;
const types_1 = require("../types");
const utils_1 = require("../utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json((0, utils_1.createErrorResponse)("Access token required"));
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        (0, types_1.logError)(new Error("JWT_SECRET is not defined"));
        res.status(500).json((0, utils_1.createErrorResponse)("Internal Server Error"));
        return;
    }
    console.log(token);
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            res.status(403).json((0, utils_1.createErrorResponse)("Invalid token"));
            return;
        }
        req.user = decoded;
        next();
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function validateRequest(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                const field = detail.path.join(".");
                if (!error[field]) {
                    errors[field] = [];
                }
                errors[field].push(detail.message);
            });
            res.status(400).json({
                success: false,
                message: "Validation error",
                errors,
            });
            return;
        }
        next();
    };
}
function errorHandler(error, req, res, next) {
    (0, types_1.logError)(error, {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json((0, utils_1.createErrorResponse)(message));
    next();
}
function corsOptions() {
    return {
        origin: "*",
        credentials: process.env.CORS_CREDENTIALS === "true",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", 'X-Internal-Request'],
    };
}
function healthCheck(req, res) {
    res.json({ status: "ok", timestamp: new Date().toISOString(), port: process.env.PORT });
}
//# sourceMappingURL=index.js.map